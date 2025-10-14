import { Product } from '../models/Product.js';

export const productController = {
  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll();
      res.json(products);
    } catch (error) {
      console.error('Error al listar productos:', error);
      res.status(500).json({ error: "Error al listar productos" });
    }
  },

  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json(product);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ error: "Error al obtener producto" });
    }
  },

  async createProduct(req, res) {
    try {
      const { nombre, precio, activo = true } = req.body;
      
      const newProduct = await Product.create({ nombre, precio, activo });
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(400).json({ error: "Error al crear producto", detail: error?.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { nombre, precio, activo } = req.body;
      
      const updated = await Product.update(req.params.id, { nombre, precio, activo });
      if (!updated) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(400).json({ error: "Error al actualizar producto", detail: error?.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const deleted = await Product.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(400).json({ error: "No se puede eliminar, producto referenciado", detail: error?.message });
    }
  }
};
