import pool from '../config/database.js';

/**
 * Modelo Carrito
 * Gestiona los carritos de compra persistentes de los usuarios
 */
export class Carrito {
  /**
   * Obtener todo el carrito de un usuario con información completa de productos
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Array>} Array de items del carrito con datos del producto
   */
  static async getByUsuario(id_usuario) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          c.id_carrito,
          c.id_usuario,
          c.id_producto,
          c.cantidad,
          c.fecha_agregado,
          c.fecha_actualizado,
          p.nombre,
          p.precio,
          p.categoria,
          p.marca,
          p.descripcion_corta,
          p.imagen,
          p.activo,
          (c.cantidad * p.precio) as subtotal
        FROM Carritos c
        INNER JOIN Productos p ON c.id_producto = p.id_producto
        WHERE c.id_usuario = ? AND p.activo = TRUE
        ORDER BY c.fecha_agregado DESC`,
        [id_usuario]
      );
      return rows;
    } catch (error) {
      console.error('Error en Carrito.getByUsuario:', error);
      throw error;
    }
  }

  /**
   * Agregar un producto al carrito o actualizar cantidad si ya existe
   * @param {number} id_usuario - ID del usuario
   * @param {number} id_producto - ID del producto
   * @param {number} cantidad - Cantidad a agregar (por defecto 1)
   * @returns {Promise<Object>} Item del carrito creado/actualizado
   */
  static async addItem(id_usuario, id_producto, cantidad = 1) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Verificar que el producto existe y está activo
      const [[producto]] = await conn.query(
        'SELECT id_producto, activo FROM Productos WHERE id_producto = ?',
        [id_producto]
      );

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      if (!producto.activo) {
        throw new Error('Producto no está disponible');
      }

      // Verificar si ya existe en el carrito
      const [[existing]] = await conn.query(
        'SELECT id_carrito, cantidad FROM Carritos WHERE id_usuario = ? AND id_producto = ?',
        [id_usuario, id_producto]
      );

      let result;
      if (existing) {
        // Actualizar cantidad existente
        const nuevaCantidad = existing.cantidad + cantidad;
        await conn.query(
          'UPDATE Carritos SET cantidad = ?, fecha_actualizado = CURRENT_TIMESTAMP WHERE id_carrito = ?',
          [nuevaCantidad, existing.id_carrito]
        );
        result = { id_carrito: existing.id_carrito, cantidad: nuevaCantidad, updated: true };
      } else {
        // Insertar nuevo item
        const [insertResult] = await conn.query(
          'INSERT INTO Carritos (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)',
          [id_usuario, id_producto, cantidad]
        );
        result = { id_carrito: insertResult.insertId, cantidad, updated: false };
      }

      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      console.error('Error en Carrito.addItem:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * Actualizar la cantidad de un producto en el carrito
   * @param {number} id_usuario - ID del usuario
   * @param {number} id_producto - ID del producto
   * @param {number} cantidad - Nueva cantidad
   * @returns {Promise<Object>} Item actualizado
   */
  static async updateQuantity(id_usuario, id_producto, cantidad) {
    try {
      if (cantidad <= 0) {
        // Si la cantidad es 0 o negativa, eliminar el item
        return await this.removeItem(id_usuario, id_producto);
      }

      const [result] = await pool.query(
        `UPDATE Carritos 
         SET cantidad = ?, fecha_actualizado = CURRENT_TIMESTAMP 
         WHERE id_usuario = ? AND id_producto = ?`,
        [cantidad, id_usuario, id_producto]
      );

      if (result.affectedRows === 0) {
        throw new Error('Item no encontrado en el carrito');
      }

      return { id_usuario, id_producto, cantidad, updated: true };
    } catch (error) {
      console.error('Error en Carrito.updateQuantity:', error);
      throw error;
    }
  }

  /**
   * Eliminar un producto específico del carrito
   * @param {number} id_usuario - ID del usuario
   * @param {number} id_producto - ID del producto
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async removeItem(id_usuario, id_producto) {
    try {
      const [result] = await pool.query(
        'DELETE FROM Carritos WHERE id_usuario = ? AND id_producto = ?',
        [id_usuario, id_producto]
      );

      if (result.affectedRows === 0) {
        throw new Error('Item no encontrado en el carrito');
      }

      return true;
    } catch (error) {
      console.error('Error en Carrito.removeItem:', error);
      throw error;
    }
  }

  /**
   * Limpiar todo el carrito de un usuario
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<boolean>} True si se limpió correctamente
   */
  static async clearCarrito(id_usuario) {
    try {
      await pool.query('DELETE FROM Carritos WHERE id_usuario = ?', [id_usuario]);
      return true;
    } catch (error) {
      console.error('Error en Carrito.clearCarrito:', error);
      throw error;
    }
  }

  /**
   * Obtener el total de items en el carrito
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<number>} Cantidad total de items
   */
  static async getItemCount(id_usuario) {
    try {
      const [[result]] = await pool.query(
        'SELECT COALESCE(SUM(cantidad), 0) as total FROM Carritos WHERE id_usuario = ?',
        [id_usuario]
      );
      return result.total;
    } catch (error) {
      console.error('Error en Carrito.getItemCount:', error);
      throw error;
    }
  }

  /**
   * Obtener el total del carrito en dinero
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<number>} Total en dinero
   */
  static async getTotal(id_usuario) {
    try {
      const [[result]] = await pool.query(
        `SELECT COALESCE(SUM(c.cantidad * p.precio), 0) as total
         FROM Carritos c
         INNER JOIN Productos p ON c.id_producto = p.id_producto
         WHERE c.id_usuario = ? AND p.activo = TRUE`,
        [id_usuario]
      );
      return parseFloat(result.total);
    } catch (error) {
      console.error('Error en Carrito.getTotal:', error);
      throw error;
    }
  }

  /**
   * Sincronizar carrito desde localStorage (migración inicial)
   * @param {number} id_usuario - ID del usuario
   * @param {Array} items - Array de items del carrito [{id_producto, cantidad}]
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  static async syncFromLocalStorage(id_usuario, items) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let added = 0;
      let updated = 0;
      let errors = [];

      for (const item of items) {
        try {
          const result = await this.addItem(id_usuario, item.id_producto, item.cantidad);
          if (result.updated) {
            updated++;
          } else {
            added++;
          }
        } catch (error) {
          errors.push({ id_producto: item.id_producto, error: error.message });
        }
      }

      await conn.commit();
      return { added, updated, errors };
    } catch (error) {
      await conn.rollback();
      console.error('Error en Carrito.syncFromLocalStorage:', error);
      throw error;
    } finally {
      conn.release();
    }
  }
}

