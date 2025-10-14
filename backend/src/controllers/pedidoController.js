import { Pedido } from '../models/Pedido.js';

export const pedidoController = {
  async createPedido(req, res) {
    try {
      const { id_usuario, id_sucursal, fecha, items = [] } = req.body;
      
      if (!id_usuario || !id_sucursal || !items.length) {
        return res.status(400).json({ error: "id_usuario, id_sucursal e items son requeridos" });
      }

      const result = await Pedido.create({ id_usuario, id_sucursal, fecha, items });
      res.status(201).json(result);
    } catch (error) {
      console.error('Error al crear pedido:', error);
      res.status(400).json({ error: "Error al crear pedido", detail: error?.message });
    }
  },

  async updateEstado(req, res) {
    try {
      const id_pedido = req.params.id;
      const { estado } = req.body;
      
      if (!["pendiente", "procesado", "completado", "cancelado"].includes(estado)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      const result = await Pedido.updateEstado(id_pedido, estado);
      res.json(result);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(400).json({ error: "Error al cambiar estado", detail: error?.message });
    }
  },

  async getAllPedidos(req, res) {
    try {
      const filters = {
        id_sucursal: req.query.id_sucursal,
        estado: req.query.estado,
        desde: req.query.desde,
        hasta: req.query.hasta,
        id_producto: req.query.id_producto
      };

      const pedidos = await Pedido.findAll(filters);
      res.json(pedidos);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ error: "Error al obtener pedidos", detail: error?.message });
    }
  },

  async getPedidoById(req, res) {
    try {
      const pedido = await Pedido.findById(req.params.id);
      if (!pedido) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
      res.json(pedido);
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({ error: "Error al obtener pedido", detail: error?.message });
    }
  }
};
