import pool from '../config/database.js';

export class Inventario {
  static async setStock(inventarioData) {
    const { id_sucursal, id_producto, cantidad, stock_minimo = 5 } = inventarioData;
    
    await pool.query(
      `INSERT INTO Inventario (id_sucursal, id_producto, cantidad, stock_minimo)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad), stock_minimo = VALUES(stock_minimo)`,
      [id_sucursal, id_producto, cantidad, stock_minimo]
    );
    
    return true;
  }

  static async incrementStock(id_sucursal, id_producto, cantidad) {
    await pool.query(
      `INSERT INTO Inventario (id_sucursal, id_producto, cantidad)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
      [id_sucursal, id_producto, cantidad]
    );
    
    return true;
  }

  static async decrementStock(id_sucursal, id_producto, cantidad) {
    const [result] = await pool.query(
      `UPDATE Inventario SET cantidad = cantidad - ? WHERE id_sucursal=? AND id_producto=?`,
      [cantidad, id_sucursal, id_producto]
    );
    
    return result.affectedRows > 0;
  }

  static async getStock(id_sucursal, id_producto) {
    const [[inventario]] = await pool.query(
      "SELECT cantidad FROM Inventario WHERE id_sucursal=? AND id_producto=? FOR UPDATE",
      [id_sucursal, id_producto]
    );
    
    return inventario?.cantidad ?? 0;
  }

  static async validateStock(id_sucursal, items) {
    for (const item of items) {
      const disponible = await this.getStock(id_sucursal, item.id_producto);
      if (disponible < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ${item.id_producto}`);
      }
    }
    return true;
  }
}
