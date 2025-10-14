import pool from '../config/database.js';
import { Inventario } from './Inventario.js';

export class Compra {
  static async create(compraData) {
    const { id_proveedor, id_sucursal, fecha, items = [] } = compraData;
    
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const total = items.reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precio_unitario), 0);
      const [compra] = await conn.query(
        "INSERT INTO Compras (id_proveedor, id_sucursal, fecha, total, estado) VALUES (?, ?, ?, ?, 'pagada')",
        [id_proveedor, id_sucursal, fecha || new Date().toISOString().slice(0,10), total]
      );
      const id_compra = compra.insertId;

      for (const it of items) {
        await conn.query(
          `INSERT INTO Detalle_Compras (id_compra, id_producto, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [id_compra, it.id_producto, it.cantidad, it.precio_unitario, it.cantidad * it.precio_unitario]
        );
        
        // Incrementar inventario
        await Inventario.incrementStock(id_sucursal, it.id_producto, it.cantidad);
      }

      await conn.commit();
      return { id_compra, total };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findAll(filters = {}) {
    const { id_sucursal, estado, desde, hasta, id_producto, agrupar } = filters;

    const where = [];
    const params = [];
    if (id_sucursal) { where.push("c.id_sucursal = ?"); params.push(id_sucursal); }
    if (estado) { where.push("c.estado = ?"); params.push(estado); }
    if (desde) { where.push("c.fecha >= ?"); params.push(desde); }
    if (hasta) { where.push("c.fecha <= ?"); params.push(hasta); }
    if (id_producto) { where.push("EXISTS (SELECT 1 FROM Detalle_Compras dc WHERE dc.id_compra=c.id_compra AND dc.id_producto=?)"); params.push(id_producto); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    if (agrupar === "dia") {
      const [rows] = await pool.query(
        `SELECT c.fecha, SUM(c.total) AS total
         FROM Compras c
         ${whereSql}
         GROUP BY c.fecha
         ORDER BY c.fecha DESC`,
        params
      );
      return rows;
    }

    if (agrupar === "producto") {
      const [rows] = await pool.query(
        `SELECT p.id_producto, p.nombre, SUM(dc.cantidad) AS cantidad, SUM(dc.subtotal) AS total
         FROM Detalle_Compras dc
         JOIN Compras c ON c.id_compra = dc.id_compra
         JOIN Productos p ON p.id_producto = dc.id_producto
         ${whereSql}
         GROUP BY p.id_producto, p.nombre
         ORDER BY total DESC`,
        params
      );
      return rows;
    }

    // Listado plano con información de productos
    const [rows] = await pool.query(
      `SELECT c.*, s.nombre AS sucursal, pr.nombre AS proveedor,
              GROUP_CONCAT(CONCAT(p.nombre, ' (', dc.cantidad, ')') SEPARATOR ', ') AS productos
       FROM Compras c
       JOIN Sucursales s ON s.id_sucursal = c.id_sucursal
       JOIN Proveedores pr ON pr.id_proveedor = c.id_proveedor
       LEFT JOIN Detalle_Compras dc ON dc.id_compra = c.id_compra
       LEFT JOIN Productos p ON p.id_producto = dc.id_producto
       ${whereSql}
       GROUP BY c.id_compra
       ORDER BY c.fecha DESC, c.id_compra DESC`,
      params
    );
    return rows;
  }

  static async findById(id) {
    const [[compra]] = await pool.query(
      `SELECT c.*, s.nombre AS sucursal, pr.nombre AS proveedor
       FROM Compras c
       JOIN Sucursales s ON s.id_sucursal = c.id_sucursal
       JOIN Proveedores pr ON pr.id_proveedor = c.id_proveedor
       WHERE c.id_compra = ?`,
      [id]
    );
    
    if (!compra) return null;

    const [items] = await pool.query(
      `SELECT dc.*, p.nombre
       FROM Detalle_Compras dc
       JOIN Productos p ON p.id_producto = dc.id_producto
       WHERE dc.id_compra = ?`,
      [id]
    );
    
    return { compra, items };
  }
}
