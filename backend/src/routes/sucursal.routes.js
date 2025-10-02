import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

// Listar sucursales
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Sucursales ORDER BY id_sucursal ASC");
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar sucursales" });
  }
});

// Inventario por sucursal (join con productos)
router.get("/:id/inventario", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.id_inventario, i.id_sucursal, i.id_producto, i.cantidad, i.stock_minimo,
              p.nombre, p.precio
       FROM Inventario i
       JOIN Productos p ON p.id_producto = i.id_producto
       WHERE i.id_sucursal = ?
       ORDER BY p.nombre ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al obtener inventario" });
  }
});

export default router;