import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

// Establecer stock puntual (upsert por sucursal/producto)
router.put("/set", async (req, res) => {
  const { id_sucursal, id_producto, cantidad, stock_minimo = 5 } = req.body;
  if (cantidad == null) return res.status(400).json({ error: "cantidad requerida" });

  try {
    await pool.query(
      `INSERT INTO Inventario (id_sucursal, id_producto, cantidad, stock_minimo)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad), stock_minimo = VALUES(stock_minimo)`,
      [id_sucursal, id_producto, cantidad, stock_minimo]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Error al establecer inventario", detail: e?.message });
  }
});

export default router;