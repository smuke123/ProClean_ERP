import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

// Listar productos
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Productos ORDER BY id_producto DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error al listar productos" });
  }
});

// Obtener producto por id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Productos WHERE id_producto = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// Crear producto
router.post("/", async (req, res) => {
  const { nombre, marca, categoria, tamano, precio, activo = true } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO Productos (nombre, marca, categoria, tamano, precio, activo) VALUES (?,?,?,?,?,?)",
      [nombre, marca, categoria, tamano, precio, activo]
    );
    res.status(201).json({ id_producto: result.insertId });
  } catch (e) {
    res.status(400).json({ error: "Error al crear producto", detail: e?.message });
  }
});

// Actualizar producto
router.put("/:id", async (req, res) => {
  const { nombre, marca, categoria, tamano, precio, activo } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE Productos SET nombre=?, marca=?, categoria=?, tamano=?, precio=?, activo=? WHERE id_producto=?",
      [nombre, marca, categoria, tamano, precio, activo, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Error al actualizar producto", detail: e?.message });
  }
});

// Eliminar producto
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM Productos WHERE id_producto = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "No se puede eliminar, producto referenciado", detail: e?.message });
  }
});

export default router;