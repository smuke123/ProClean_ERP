import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

// Crear pedido (pendiente)
router.post("/", async (req, res) => {
  const { id_usuario, id_sucursal, fecha, items = [] } = req.body;
  if (!id_usuario || !id_sucursal || !items.length)
    return res.status(400).json({ error: "id_usuario, id_sucursal e items son requeridos" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const total = items.reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precio_unitario), 0);
    const [pedido] = await conn.query(
      "INSERT INTO Pedidos (id_usuario, id_sucursal, fecha, total, estado) VALUES (?, ?, ?, ?, 'pendiente')",
      [id_usuario, id_sucursal, fecha || new Date().toISOString().slice(0,10), total]
    );
    const id_pedido = pedido.insertId;

    for (const it of items) {
      await conn.query(
        `INSERT INTO Detalle_Pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [id_pedido, it.id_producto, it.cantidad, it.precio_unitario, it.cantidad * it.precio_unitario]
      );
    }

    await conn.commit();
    res.status(201).json({ id_pedido, total, estado: "pendiente" });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: "Error al crear pedido", detail: e?.message });
  } finally {
    conn.release();
  }
});

// Cambiar estado del pedido (procesado -> descuenta stock; completado -> tracking)
router.put("/:id/estado", async (req, res) => {
  const id_pedido = req.params.id;
  const { estado } = req.body; // 'pendiente' | 'procesado' | 'completado' | 'cancelado'
  if (!["pendiente", "procesado", "completado", "cancelado"].includes(estado))
    return res.status(400).json({ error: "Estado inválido" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[pedido]] = await conn.query("SELECT id_sucursal, estado FROM Pedidos WHERE id_pedido = ?", [id_pedido]);
    if (!pedido) throw new Error("Pedido no existe");

    // Obtener items del pedido
    const [items] = await conn.query(
      `SELECT dp.id_producto, dp.cantidad
       FROM Detalle_Pedidos dp
       WHERE dp.id_pedido = ?`,
      [id_pedido]
    );

    if (estado === "procesado") {
      // Validar stock suficiente y descontar
      for (const it of items) {
        const [[inv]] = await conn.query(
          "SELECT cantidad FROM Inventario WHERE id_sucursal=? AND id_producto=? FOR UPDATE",
          [pedido.id_sucursal, it.id_producto]
        );
        const disponible = inv?.cantidad ?? 0;
        if (disponible < it.cantidad) throw new Error(`Stock insuficiente para producto ${it.id_producto}`);
      }
      for (const it of items) {
        await conn.query(
          `UPDATE Inventario SET cantidad = cantidad - ? WHERE id_sucursal=? AND id_producto=?`,
          [it.cantidad, pedido.id_sucursal, it.id_producto]
        );
      }
    }

    await conn.query("UPDATE Pedidos SET estado = ? WHERE id_pedido = ?", [estado, id_pedido]);

    await conn.commit();
    res.json({ id_pedido, estado });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: "Error al cambiar estado", detail: e?.message });
  } finally {
    conn.release();
  }
});

// Listado/Informe de pedidos (ventas) con filtros
// Query: id_sucursal, estado, desde, hasta, id_producto
router.get("/", async (req, res) => {
  const { id_sucursal, estado, desde, hasta, id_producto } = req.query;
  const where = [];
  const params = [];
  if (id_sucursal) { where.push("p.id_sucursal = ?"); params.push(id_sucursal); }
  if (estado) { where.push("p.estado = ?"); params.push(estado); }
  if (desde) { where.push("p.fecha >= ?"); params.push(desde); }
  if (hasta) { where.push("p.fecha <= ?"); params.push(hasta); }
  if (id_producto) { where.push("EXISTS (SELECT 1 FROM Detalle_Pedidos dp WHERE dp.id_pedido=p.id_pedido AND dp.id_producto=?)"); params.push(id_producto); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  try {
    const [rows] = await pool.query(
      `SELECT p.*, s.nombre AS sucursal, u.nombre AS cliente,
              GROUP_CONCAT(CONCAT(pr.nombre, ' (', dp.cantidad, ')') SEPARATOR ', ') AS productos
       FROM Pedidos p
       JOIN Sucursales s ON s.id_sucursal = p.id_sucursal
       JOIN Usuarios u ON u.id_usuario = p.id_usuario
       LEFT JOIN Detalle_Pedidos dp ON dp.id_pedido = p.id_pedido
       LEFT JOIN Productos pr ON pr.id_producto = dp.id_producto
       ${whereSql}
       GROUP BY p.id_pedido
       ORDER BY p.fecha DESC, p.id_pedido DESC`,
      params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener pedidos", detail: e?.message });
  }
});

// Detalle de pedido por id
router.get("/:id", async (req, res) => {
  try {
    const [[pedido]] = await pool.query(
      `SELECT p.*, s.nombre AS sucursal, u.nombre AS cliente
       FROM Pedidos p
       JOIN Sucursales s ON s.id_sucursal = p.id_sucursal
       JOIN Usuarios u ON u.id_usuario = p.id_usuario
       WHERE p.id_pedido = ?`,
      [req.params.id]
    );
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

    const [items] = await pool.query(
      `SELECT dp.*, pr.nombre
       FROM Detalle_Pedidos dp
       JOIN Productos pr ON pr.id_producto = dp.id_producto
       WHERE dp.id_pedido = ?`,
      [req.params.id]
    );
    res.json({ pedido, items });
  } catch (e) {
    res.status(500).json({ error: "Error al obtener pedido", detail: e?.message });
  }
});

export default router;