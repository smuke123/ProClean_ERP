import { Compra } from '../models/Compra.js';

export const compraController = {
  async createCompra(req, res) {
    try {
      const { id_proveedor, id_sucursal, fecha, items = [] } = req.body;
      
      if (!id_proveedor || !id_sucursal || !items.length) {
        return res.status(400).json({ error: "id_proveedor, id_sucursal e items son requeridos" });
      }

      const result = await Compra.create({ id_proveedor, id_sucursal, fecha, items });
      res.status(201).json(result);
    } catch (error) {
      console.error('Error al registrar compra:', error);
      res.status(400).json({ error: "Error al registrar compra", detail: error?.message });
    }
  },

  async getAllCompras(req, res) {
    try {
      const filters = {
        id_sucursal: req.query.id_sucursal,
        estado: req.query.estado,
        desde: req.query.desde,
        hasta: req.query.hasta,
        id_producto: req.query.id_producto,
        agrupar: req.query.agrupar
      };

      const compras = await Compra.findAll(filters);
      res.json(compras);
    } catch (error) {
      console.error('Error al obtener compras:', error);
      res.status(500).json({ error: "Error al obtener compras", detail: error?.message });
    }
  },

  async getCompraById(req, res) {
    try {
      const compra = await Compra.findById(req.params.id);
      if (!compra) {
        return res.status(404).json({ error: "Compra no encontrada" });
      }
      res.json(compra);
    } catch (error) {
      console.error('Error al obtener compra:', error);
      res.status(500).json({ error: "Error al obtener compra", detail: error?.message });
    }
  }
};
