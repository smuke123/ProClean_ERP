import { Inventario } from '../models/Inventario.js';

export const inventarioController = {
  async setStock(req, res) {
    try {
      const { id_sucursal, id_producto, cantidad, stock_minimo = 5 } = req.body;
      
      if (cantidad == null) {
        return res.status(400).json({ error: "cantidad requerida" });
      }

      await Inventario.setStock({ id_sucursal, id_producto, cantidad, stock_minimo });
      res.json({ ok: true });
    } catch (error) {
      console.error('Error al establecer inventario:', error);
      res.status(400).json({ error: "Error al establecer inventario", detail: error?.message });
    }
  }
};
