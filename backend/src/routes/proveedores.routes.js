import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

// Listar proveedores
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_proveedor, nombre, contacto, telefono, direccion, estado FROM Proveedores ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error al listar proveedores" });
  }
});

// Obtener proveedor por id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_proveedor, nombre, contacto, telefono, direccion, estado FROM Proveedores WHERE id_proveedor = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener proveedor" });
  }
});

export default router;


