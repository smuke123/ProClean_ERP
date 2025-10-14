import { Sucursal } from '../models/Sucursal.js';

export const sucursalController = {
  async getAllSucursales(req, res) {
    try {
      const sucursales = await Sucursal.findAll();
      res.json(sucursales);
    } catch (error) {
      console.error('Error al listar sucursales:', error);
      res.status(500).json({ error: "Error al listar sucursales" });
    }
  },

  async getInventarioBySucursal(req, res) {
    try {
      const inventario = await Sucursal.getInventarioBySucursal(req.params.id);
      res.json(inventario);
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({ error: "Error al obtener inventario" });
    }
  }
};
