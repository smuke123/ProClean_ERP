import pool from '../config/database.js';

export class Product {
  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM Productos ORDER BY id_producto DESC");
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM Productos WHERE id_producto = ?", [id]);
    return rows[0] || null;
  }

  static async create(productData) {
    const { nombre, precio, activo = true } = productData;
    
    const [result] = await pool.query(
      "INSERT INTO Productos (nombre, precio, activo) VALUES (?,?,?)",
      [nombre, precio, activo]
    );
    
    return {
      id_producto: result.insertId,
      nombre,
      precio,
      activo
    };
  }

  static async update(id, productData) {
    const { nombre, precio, activo } = productData;
    
    const [result] = await pool.query(
      "UPDATE Productos SET nombre=?, precio=?, activo=? WHERE id_producto=?",
      [nombre, precio, activo, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query("DELETE FROM Productos WHERE id_producto = ?", [id]);
    return result.affectedRows > 0;
  }
}
