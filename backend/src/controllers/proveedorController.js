import { Proveedor } from '../models/Proveedor.js';

export const proveedorController = {
  async getAllProveedores(req, res) {
    try {
      const proveedores = await Proveedor.findAll();
      res.json(proveedores);
    } catch (error) {
      console.error('Error al listar proveedores:', error);
      res.status(500).json({ error: "Error al listar proveedores" });
    }
  },

  async getProveedorById(req, res) {
    try {
      const proveedor = await Proveedor.findById(req.params.id);
      if (!proveedor) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }
      res.json(proveedor);
    } catch (error) {
      console.error('Error al obtener proveedor:', error);
      res.status(500).json({ error: "Error al obtener proveedor" });
    }
  },

  async createProveedor(req, res) {
    try {
      const { nombre, contacto, telefono, direccion, estado = 'activo' } = req.body;
      
      const newProveedor = await Proveedor.create({ nombre, contacto, telefono, direccion, estado });
      res.status(201).json(newProveedor);
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      res.status(400).json({ error: "Error al crear proveedor", detail: error?.message });
    }
  },

  async updateProveedor(req, res) {
    try {
      const { nombre, contacto, telefono, direccion, estado } = req.body;
      
      const updated = await Proveedor.update(req.params.id, { nombre, contacto, telefono, direccion, estado });
      if (!updated) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      res.status(400).json({ error: "Error al actualizar proveedor", detail: error?.message });
    }
  },

  async deleteProveedor(req, res) {
    try {
      const deleted = await Proveedor.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      res.status(400).json({ error: "No se puede eliminar, proveedor referenciado", detail: error?.message });
    }
  }
};
