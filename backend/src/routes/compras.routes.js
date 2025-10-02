import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

// Crear compra: incrementa inventario
router.post("/", async (req, res) => {
  const { id_proveedor, id_sucursal, fecha, items = [] } = req.body;
  if (!id_proveedor || !id_sucursal || !items.length)
    return res.status(400).json({ error: "id_proveedor, id_sucursal e items son requeridos" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const total = items.reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precio_unitario), 0);
    const [compra] = await conn.query(
      "INSERT INTO Compras (id_proveedor, id_sucursal, fecha, total, estado) VALUES (?, ?, ?, ?, 'pagada')",
      [id_proveedor, id_sucursal, fecha || new Date().toISOString().slice(0,10), total]
    );
    const id_compra = compra.insertId;

    for (const it of items) {
      await conn.query(
        `INSERT INTO Detalle_Compras (id_compra, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [id_compra, it.id_producto, it.cantidad, it.precio_unitario, it.cantidad * it.precio_unitario]
      );
      await conn.query(
        `INSERT INTO Inventario (id_sucursal, id_producto, cantidad)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
        [id_sucursal, it.id_producto, it.cantidad]
      );
    }

    await conn.commit();
    res.status(201).json({ id_compra, total });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: "Error al registrar compra", detail: e?.message });
  } finally {
    conn.release();
  }
});

// Listado/Informe de compras con filtros y agregaciones
// Query params: id_sucursal, estado, desde, hasta, id_producto, agrupar(dia|producto)
router.get("/", async (req, res) => {
  const { id_sucursal, estado, desde, hasta, id_producto, agrupar } = req.query;

  const where = [];
  const params = [];
  if (id_sucursal) { where.push("c.id_sucursal = ?"); params.push(id_sucursal); }
  if (estado) { where.push("c.estado = ?"); params.push(estado); }
  if (desde) { where.push("c.fecha >= ?"); params.push(desde); }
  if (hasta) { where.push("c.fecha <= ?"); params.push(hasta); }
  if (id_producto) { where.push("EXISTS (SELECT 1 FROM Detalle_Compras dc WHERE dc.id_compra=c.id_compra AND dc.id_producto=?)"); params.push(id_producto); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    if (agrupar === "dia") {
      const [rows] = await pool.query(
        `SELECT c.fecha, SUM(c.total) AS total
         FROM Compras c
         ${whereSql}
         GROUP BY c.fecha
         ORDER BY c.fecha DESC`,
        params
      );
      return res.json(rows);
    }

    if (agrupar === "producto") {
      const [rows] = await pool.query(
        `SELECT p.id_producto, p.nombre, SUM(dc.cantidad) AS cantidad, SUM(dc.subtotal) AS total
         FROM Detalle_Compras dc
         JOIN Compras c ON c.id_compra = dc.id_compra
         JOIN Productos p ON p.id_producto = dc.id_producto
         ${whereSql}
         GROUP BY p.id_producto, p.nombre
         ORDER BY total DESC`,
        params
      );
      return res.json(rows);
    }

    // Listado plano
    const [rows] = await pool.query(
      `SELECT c.*, s.nombre AS sucursal, pr.nombre AS proveedor
       FROM Compras c
       JOIN Sucursales s ON s.id_sucursal = c.id_sucursal
       JOIN Proveedores pr ON pr.id_proveedor = c.id_proveedor
       ${whereSql}
       ORDER BY c.fecha DESC, c.id_compra DESC`,
      params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener compras", detail: e?.message });
  }
});

// Detalle de compra por id
router.get("/:id", async (req, res) => {
  try {
    const [[compra]] = await pool.query(
      `SELECT c.*, s.nombre AS sucursal, pr.nombre AS proveedor
       FROM Compras c
       JOIN Sucursales s ON s.id_sucursal = c.id_sucursal
       JOIN Proveedores pr ON pr.id_proveedor = c.id_proveedor
       WHERE c.id_compra = ?`,
      [req.params.id]
    );
    if (!compra) return res.status(404).json({ error: "Compra no encontrada" });

    const [items] = await pool.query(
      `SELECT dc.*, p.nombre
       FROM Detalle_Compras dc
       JOIN Productos p ON p.id_producto = dc.id_producto
       WHERE dc.id_compra = ?`,
      [req.params.id]
    );
    res.json({ compra, items });
  } catch (e) {
    res.status(500).json({ error: "Error al obtener compra", detail: e?.message });
  }
});

export default router;