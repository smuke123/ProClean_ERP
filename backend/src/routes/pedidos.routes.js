import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

// Crear pedido (pendiente)
router.post("/", async (req, res) => {
  const { id_usuario, id_sucursal, items = [] } = req.body;
  if (!id_usuario || !id_sucursal || !items.length)
    return res.status(400).json({ error: "id_usuario, id_sucursal e items son requeridos" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const total = items.reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precio_unitario), 0);
    const [pedido] = await conn.query(
      "INSERT INTO Pedidos (id_usuario, id_sucursal, fecha, total, estado) VALUES (?, ?, CURDATE(), ?, 'pendiente')",
      [id_usuario, id_sucursal, total]
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

export default router;