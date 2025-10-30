import { Carrito } from '../models/Carrito.js';

/**
 * Controlador para gestionar las operaciones del carrito de compras
 */
export const carritoController = {
  /**
   * Obtener el carrito completo del usuario autenticado
   */
  async getCarrito(req, res) {
    try {
      const id_usuario = req.user.id; // Del middleware de autenticación
      
      const items = await Carrito.getByUsuario(id_usuario);
      const total = await Carrito.getTotal(id_usuario);
      const itemCount = await Carrito.getItemCount(id_usuario);

      res.json({
        items,
        total,
        itemCount
      });
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      res.status(500).json({ 
        error: 'Error al obtener carrito', 
        detail: error?.message 
      });
    }
  },

  /**
   * Agregar un producto al carrito
   */
  async addItem(req, res) {
    try {
      const id_usuario = req.user.id;
      const { id_producto, cantidad = 1 } = req.body;

      if (!id_producto) {
        return res.status(400).json({ error: 'id_producto es requerido' });
      }

      if (cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      }

      const result = await Carrito.addItem(id_usuario, id_producto, cantidad);
      
      // Obtener el carrito actualizado
      const items = await Carrito.getByUsuario(id_usuario);
      const total = await Carrito.getTotal(id_usuario);
      const itemCount = await Carrito.getItemCount(id_usuario);

      res.status(result.updated ? 200 : 201).json({
        message: result.updated ? 'Producto actualizado en el carrito' : 'Producto agregado al carrito',
        item: result,
        carrito: {
          items,
          total,
          itemCount
        }
      });
    } catch (error) {
      console.error('Error al agregar item al carrito:', error);
      res.status(400).json({ 
        error: 'Error al agregar producto al carrito', 
        detail: error?.message 
      });
    }
  },

  /**
   * Actualizar la cantidad de un producto en el carrito
   */
  async updateQuantity(req, res) {
    try {
      const id_usuario = req.user.id;
      const id_producto = parseInt(req.params.id_producto);
      const { cantidad } = req.body;

      if (cantidad === undefined || cantidad === null) {
        return res.status(400).json({ error: 'cantidad es requerida' });
      }

      if (cantidad < 0) {
        return res.status(400).json({ error: 'La cantidad no puede ser negativa' });
      }

      // Si cantidad es 0, eliminar el item
      if (cantidad === 0) {
        await Carrito.removeItem(id_usuario, id_producto);
        const items = await Carrito.getByUsuario(id_usuario);
        const total = await Carrito.getTotal(id_usuario);
        const itemCount = await Carrito.getItemCount(id_usuario);

        return res.json({
          message: 'Producto eliminado del carrito',
          carrito: {
            items,
            total,
            itemCount
          }
        });
      }

      const result = await Carrito.updateQuantity(id_usuario, id_producto, cantidad);
      
      // Obtener el carrito actualizado
      const items = await Carrito.getByUsuario(id_usuario);
      const total = await Carrito.getTotal(id_usuario);
      const itemCount = await Carrito.getItemCount(id_usuario);

      res.json({
        message: 'Cantidad actualizada',
        item: result,
        carrito: {
          items,
          total,
          itemCount
        }
      });
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      res.status(400).json({ 
        error: 'Error al actualizar cantidad', 
        detail: error?.message 
      });
    }
  },

  /**
   * Eliminar un producto específico del carrito
   */
  async removeItem(req, res) {
    try {
      const id_usuario = req.user.id;
      const id_producto = parseInt(req.params.id_producto);

      await Carrito.removeItem(id_usuario, id_producto);
      
      // Obtener el carrito actualizado
      const items = await Carrito.getByUsuario(id_usuario);
      const total = await Carrito.getTotal(id_usuario);
      const itemCount = await Carrito.getItemCount(id_usuario);

      res.json({
        message: 'Producto eliminado del carrito',
        carrito: {
          items,
          total,
          itemCount
        }
      });
    } catch (error) {
      console.error('Error al eliminar item:', error);
      res.status(400).json({ 
        error: 'Error al eliminar producto', 
        detail: error?.message 
      });
    }
  },

  /**
   * Limpiar todo el carrito
   */
  async clearCarrito(req, res) {
    try {
      const id_usuario = req.user.id;

      await Carrito.clearCarrito(id_usuario);

      res.json({
        message: 'Carrito limpiado correctamente',
        carrito: {
          items: [],
          total: 0,
          itemCount: 0
        }
      });
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
      res.status(500).json({ 
        error: 'Error al limpiar carrito', 
        detail: error?.message 
      });
    }
  },

  /**
   * Sincronizar carrito desde localStorage
   * Útil para migrar carritos existentes en el cliente al backend
   */
  async syncCarrito(req, res) {
    try {
      const id_usuario = req.user.id;
      const { items = [] } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'items debe ser un array' });
      }

      // Validar formato de items
      for (const item of items) {
        if (!item.id_producto || !item.cantidad) {
          return res.status(400).json({ 
            error: 'Cada item debe tener id_producto y cantidad' 
          });
        }
      }

      const result = await Carrito.syncFromLocalStorage(id_usuario, items);
      
      // Obtener el carrito actualizado
      const carritoItems = await Carrito.getByUsuario(id_usuario);
      const total = await Carrito.getTotal(id_usuario);
      const itemCount = await Carrito.getItemCount(id_usuario);

      res.json({
        message: 'Carrito sincronizado correctamente',
        sync: result,
        carrito: {
          items: carritoItems,
          total,
          itemCount
        }
      });
    } catch (error) {
      console.error('Error al sincronizar carrito:', error);
      res.status(400).json({ 
        error: 'Error al sincronizar carrito', 
        detail: error?.message 
      });
    }
  },

  /**
   * Obtener resumen del carrito (solo totales, sin items)
   */
  async getSummary(req, res) {
    try {
      const id_usuario = req.user.id;
      
      const total = await Carrito.getTotal(id_usuario);
      const itemCount = await Carrito.getItemCount(id_usuario);

      res.json({
        total,
        itemCount
      });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({ 
        error: 'Error al obtener resumen', 
        detail: error?.message 
      });
    }
  }
};

