import pool from '../config/database.js';

export class Sucursal {
  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM Sucursales ORDER BY id_sucursal ASC");
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM Sucursales WHERE id_sucursal = ?", [id]);
    return rows[0] || null;
  }

  static async getInventarioBySucursal(id) {
    const [rows] = await pool.query(
      `SELECT i.id_inventario, i.id_sucursal, i.id_producto, i.cantidad, i.stock_minimo,
              p.nombre, p.precio
       FROM Inventario i
       JOIN Productos p ON p.id_producto = i.id_producto
       WHERE i.id_sucursal = ?
       ORDER BY p.nombre ASC`,
      [id]
    );
    return rows;
  }
}
