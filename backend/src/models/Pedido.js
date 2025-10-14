import pool from '../config/database.js';
import { Inventario } from './Inventario.js';

export class Pedido {
  static async create(pedidoData) {
    const { id_usuario, id_sucursal, fecha, items = [] } = pedidoData;
    
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const total = items.reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precio_unitario), 0);
      const [pedido] = await conn.query(
        "INSERT INTO Pedidos (id_usuario, id_sucursal, fecha, total, estado) VALUES (?, ?, ?, ?, 'pendiente')",
        [id_usuario, id_sucursal, fecha || new Date().toISOString().slice(0,10), total]
      );
      const id_pedido = pedido.insertId;

      for (const it of items) {
        await conn.query(
          `INSERT INTO Detalle_Pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [id_pedido, it.id_producto, it.cantidad, it.precio_unitario, it.cantidad * it.precio_unitario]
        );
      }

      await conn.commit();
      return { id_pedido, total, estado: "pendiente" };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updateEstado(id_pedido, estado) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [[pedido]] = await conn.query("SELECT id_sucursal, estado FROM Pedidos WHERE id_pedido = ?", [id_pedido]);
      if (!pedido) throw new Error("Pedido no existe");

      // Obtener items del pedido
      const [items] = await conn.query(
        `SELECT dp.id_producto, dp.cantidad
         FROM Detalle_Pedidos dp
         WHERE dp.id_pedido = ?`,
        [id_pedido]
      );

      if (estado === "procesado") {
        // Validar stock suficiente y descontar
        await Inventario.validateStock(pedido.id_sucursal, items);
        
        for (const it of items) {
          await Inventario.decrementStock(pedido.id_sucursal, it.id_producto, it.cantidad);
        }
      }

      await conn.query("UPDATE Pedidos SET estado = ? WHERE id_pedido = ?", [estado, id_pedido]);

      await conn.commit();
      return { id_pedido, estado };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findAll(filters = {}) {
    const { id_sucursal, estado, desde, hasta, id_producto } = filters;
    const where = [];
    const params = [];
    if (id_sucursal) { where.push("p.id_sucursal = ?"); params.push(id_sucursal); }
    if (estado) { where.push("p.estado = ?"); params.push(estado); }
    if (desde) { where.push("p.fecha >= ?"); params.push(desde); }
    if (hasta) { where.push("p.fecha <= ?"); params.push(hasta); }
    if (id_producto) { where.push("EXISTS (SELECT 1 FROM Detalle_Pedidos dp WHERE dp.id_pedido=p.id_pedido AND dp.id_producto=?)"); params.push(id_producto); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
    const [rows] = await pool.query(
      `SELECT p.*, s.nombre AS sucursal, u.nombre AS cliente,
              GROUP_CONCAT(CONCAT(pr.nombre, ' (', dp.cantidad, ')') SEPARATOR ', ') AS productos
       FROM Pedidos p
       JOIN Sucursales s ON s.id_sucursal = p.id_sucursal
       JOIN Usuarios u ON u.id_usuario = p.id_usuario
       LEFT JOIN Detalle_Pedidos dp ON dp.id_pedido = p.id_pedido
       LEFT JOIN Productos pr ON pr.id_producto = dp.id_producto
       ${whereSql}
       GROUP BY p.id_pedido
       ORDER BY p.fecha DESC, p.id_pedido DESC`,
      params
    );
    return rows;
  }

  static async findById(id) {
    const [[pedido]] = await pool.query(
      `SELECT p.*, s.nombre AS sucursal, u.nombre AS cliente
       FROM Pedidos p
       JOIN Sucursales s ON s.id_sucursal = p.id_sucursal
       JOIN Usuarios u ON u.id_usuario = p.id_usuario
       WHERE p.id_pedido = ?`,
      [id]
    );
    
    if (!pedido) return null;

    const [items] = await pool.query(
      `SELECT dp.*, pr.nombre
       FROM Detalle_Pedidos dp
       JOIN Productos pr ON pr.id_producto = dp.id_producto
       WHERE dp.id_pedido = ?`,
      [id]
    );
    
    return { pedido, items };
  }
}
