import pool from '../config/database.js';

export class Proveedor {
  static async findAll() {
    const [rows] = await pool.query(
      "SELECT id_proveedor, nombre, contacto, telefono, direccion, estado FROM Proveedores ORDER BY nombre ASC"
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      "SELECT id_proveedor, nombre, contacto, telefono, direccion, estado FROM Proveedores WHERE id_proveedor = ?",
      [id]
    );
    return rows[0] || null;
  }

  static async create(proveedorData) {
    const { nombre, contacto, telefono, direccion, estado = 'activo' } = proveedorData;
    
    const [result] = await pool.query(
      "INSERT INTO Proveedores (nombre, contacto, telefono, direccion, estado) VALUES (?, ?, ?, ?, ?)",
      [nombre, contacto, telefono, direccion, estado]
    );
    
    return {
      id_proveedor: result.insertId,
      nombre,
      contacto,
      telefono,
      direccion,
      estado
    };
  }

  static async update(id, proveedorData) {
    const { nombre, contacto, telefono, direccion, estado } = proveedorData;
    
    const [result] = await pool.query(
      "UPDATE Proveedores SET nombre=?, contacto=?, telefono=?, direccion=?, estado=? WHERE id_proveedor=?",
      [nombre, contacto, telefono, direccion, estado, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query("DELETE FROM Proveedores WHERE id_proveedor = ?", [id]);
    return result.affectedRows > 0;
  }
}
