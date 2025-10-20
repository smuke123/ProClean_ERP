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
    const { 
      nombre, 
      precio, 
      categoria = null, 
      marca = null, 
      descripcion_corta = null, 
      descripcion = null, 
      imagen = null, 
      activo = true 
    } = productData;
    
    const [result] = await pool.query(
      "INSERT INTO Productos (nombre, precio, categoria, marca, descripcion_corta, descripcion, imagen, activo) VALUES (?,?,?,?,?,?,?,?)",
      [nombre, precio, categoria, marca, descripcion_corta, descripcion, imagen, activo]
    );
    
    return {
      id_producto: result.insertId,
      nombre,
      precio,
      categoria,
      marca,
      descripcion_corta,
      descripcion,
      imagen,
      activo
    };
  }

  static async update(id, productData) {
    const { 
      nombre, 
      precio, 
      categoria, 
      marca, 
      descripcion_corta, 
      descripcion, 
      imagen, 
      activo 
    } = productData;
    
    const [result] = await pool.query(
      "UPDATE Productos SET nombre=?, precio=?, categoria=?, marca=?, descripcion_corta=?, descripcion=?, imagen=?, activo=? WHERE id_producto=?",
      [nombre, precio, categoria, marca, descripcion_corta, descripcion, imagen, activo, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query("DELETE FROM Productos WHERE id_producto = ?", [id]);
    return result.affectedRows > 0;
  }
}
