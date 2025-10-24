import { Pedido } from '../models/Pedido.js';
import { Compra } from '../models/Compra.js';
import { Product } from '../models/Product.js';
import { Sucursal } from '../models/Sucursal.js';
import pool from '../config/database.js';

/**
 * Controlador de Exportación de Datos
 * Proporciona endpoints para que organizaciones externas consuman datos en tiempo real
 */
export const exportController = {
  /**
   * Información general de la API
   */
  async getApiInfo(req, res) {
    try {
      res.json({
        api_name: 'ProClean ERP Data Export API',
        version: '1.0.0',
        description: 'API de exportación de datos en tiempo real',
        authenticated_as: req.apiKey.nombre,
        organization: req.apiKey.organizacion,
        permissions: req.apiKey.permisos,
        available_resources: req.apiKey.recursos_permitidos,
        rate_limit: req.apiKey.rate_limit,
        requests_used: req.apiKey.total_requests,
        endpoints: {
          ventas: '/api/export/ventas',
          compras: '/api/export/compras',
          productos: '/api/export/productos',
          inventario: '/api/export/inventario',
          sucursales: '/api/export/sucursales',
          all: '/api/export/all'
        },
        documentation: '/api/export/docs'
      });
    } catch (error) {
      console.error('Error en getApiInfo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  /**
   * Exportar datos de ventas/pedidos
   */
  async exportVentas(req, res) {
    try {
      const filters = {
        id_sucursal: req.query.sucursal,
        estado: req.query.estado,
        desde: req.query.desde,
        hasta: req.query.hasta
      };

      const ventas = await Pedido.findAll(filters);

      // Calcular estadísticas
      const total = ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
      const porEstado = ventas.reduce((acc, v) => {
        acc[v.estado] = (acc[v.estado] || 0) + 1;
        return acc;
      }, {});

      res.json({
        source: 'ProClean ERP',
        resource: 'ventas',
        timestamp: new Date().toISOString(),
        total_records: ventas.length,
        filters_applied: filters,
        data: ventas,
        summary: {
          total_amount: total,
          by_status: porEstado,
          period: {
            from: filters.desde || 'all',
            to: filters.hasta || 'now'
          }
        },
        metadata: {
          currency: 'USD',
          timezone: 'UTC',
          exported_by: req.apiKey.organizacion
        }
      });
    } catch (error) {
      console.error('Error exportando ventas:', error);
      res.status(500).json({
        error: 'Error al exportar ventas',
        detail: error.message
      });
    }
  },

  /**
   * Exportar datos de compras
   */
  async exportCompras(req, res) {
    try {
      const filters = {
        id_sucursal: req.query.sucursal,
        estado: req.query.estado,
        desde: req.query.desde,
        hasta: req.query.hasta
      };

      const compras = await Compra.findAll(filters);

      // Calcular estadísticas
      const total = compras.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);
      const porEstado = compras.reduce((acc, c) => {
        acc[c.estado] = (acc[c.estado] || 0) + 1;
        return acc;
      }, {});

      res.json({
        source: 'ProClean ERP',
        resource: 'compras',
        timestamp: new Date().toISOString(),
        total_records: compras.length,
        filters_applied: filters,
        data: compras,
        summary: {
          total_amount: total,
          by_status: porEstado,
          period: {
            from: filters.desde || 'all',
            to: filters.hasta || 'now'
          }
        },
        metadata: {
          currency: 'USD',
          timezone: 'UTC',
          exported_by: req.apiKey.organizacion
        }
      });
    } catch (error) {
      console.error('Error exportando compras:', error);
      res.status(500).json({
        error: 'Error al exportar compras',
        detail: error.message
      });
    }
  },

  /**
   * Exportar catálogo de productos
   */
  async exportProductos(req, res) {
    try {
      const filters = {
        categoria: req.query.categoria,
        marca: req.query.marca,
        activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined
      };

      const productos = await Product.findAll(filters);

      // Estadísticas
      const porCategoria = productos.reduce((acc, p) => {
        const cat = p.categoria || 'Sin categoría';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const porMarca = productos.reduce((acc, p) => {
        const marca = p.marca || 'Sin marca';
        acc[marca] = (acc[marca] || 0) + 1;
        return acc;
      }, {});

      res.json({
        source: 'ProClean ERP',
        resource: 'productos',
        timestamp: new Date().toISOString(),
        total_records: productos.length,
        filters_applied: filters,
        data: productos,
        summary: {
          total_products: productos.length,
          active_products: productos.filter(p => p.activo).length,
          by_category: porCategoria,
          by_brand: porMarca,
          price_range: {
            min: Math.min(...productos.map(p => parseFloat(p.precio || 0))),
            max: Math.max(...productos.map(p => parseFloat(p.precio || 0))),
            avg: productos.reduce((sum, p) => sum + parseFloat(p.precio || 0), 0) / productos.length
          }
        },
        metadata: {
          currency: 'USD',
          exported_by: req.apiKey.organizacion
        }
      });
    } catch (error) {
      console.error('Error exportando productos:', error);
      res.status(500).json({
        error: 'Error al exportar productos',
        detail: error.message
      });
    }
  },

  /**
   * Exportar inventario por sucursal
   */
  async exportInventario(req, res) {
    try {
      const id_sucursal = req.query.sucursal;

      let query = `
        SELECT 
          i.id_inventario,
          i.id_sucursal,
          s.nombre as sucursal,
          s.codigo_sucursal,
          i.id_producto,
          p.nombre as producto,
          p.categoria,
          p.marca,
          p.precio,
          i.cantidad_disponible,
          i.cantidad_minima,
          i.fecha_actualizacion,
          CASE 
            WHEN i.cantidad_disponible <= i.cantidad_minima THEN 'bajo'
            WHEN i.cantidad_disponible > i.cantidad_minima * 2 THEN 'alto'
            ELSE 'normal'
          END as nivel_stock,
          (i.cantidad_disponible * p.precio) as valor_inventario
        FROM Inventario i
        INNER JOIN Productos p ON i.id_producto = p.id_producto
        INNER JOIN Sucursales s ON i.id_sucursal = s.id_sucursal
      `;

      const params = [];

      if (id_sucursal) {
        query += ' WHERE i.id_sucursal = ?';
        params.push(id_sucursal);
      }

      query += ' ORDER BY s.nombre, p.nombre';

      const [inventario] = await pool.query(query, params);

      // Estadísticas
      const totalValor = inventario.reduce((sum, i) => sum + parseFloat(i.valor_inventario || 0), 0);
      const porSucursal = inventario.reduce((acc, i) => {
        const suc = i.sucursal;
        if (!acc[suc]) {
          acc[suc] = { items: 0, valor: 0 };
        }
        acc[suc].items += 1;
        acc[suc].valor += parseFloat(i.valor_inventario || 0);
        return acc;
      }, {});

      const alertas = {
        stock_bajo: inventario.filter(i => i.nivel_stock === 'bajo').length,
        sin_stock: inventario.filter(i => i.cantidad_disponible === 0).length
      };

      res.json({
        source: 'ProClean ERP',
        resource: 'inventario',
        timestamp: new Date().toISOString(),
        total_records: inventario.length,
        filters_applied: { sucursal: id_sucursal || 'todas' },
        data: inventario,
        summary: {
          total_items: inventario.length,
          total_value: totalValor,
          by_branch: porSucursal,
          alerts: alertas
        },
        metadata: {
          currency: 'USD',
          exported_by: req.apiKey.organizacion
        }
      });
    } catch (error) {
      console.error('Error exportando inventario:', error);
      res.status(500).json({
        error: 'Error al exportar inventario',
        detail: error.message
      });
    }
  },

  /**
   * Exportar información de sucursales
   */
  async exportSucursales(req, res) {
    try {
      const sucursales = await Sucursal.findAll();

      res.json({
        source: 'ProClean ERP',
        resource: 'sucursales',
        timestamp: new Date().toISOString(),
        total_records: sucursales.length,
        data: sucursales,
        metadata: {
          exported_by: req.apiKey.organizacion
        }
      });
    } catch (error) {
      console.error('Error exportando sucursales:', error);
      res.status(500).json({
        error: 'Error al exportar sucursales',
        detail: error.message
      });
    }
  },

  /**
   * Exportar todos los datos disponibles (dataset completo)
   */
  async exportAll(req, res) {
    try {
      const filters = {
        desde: req.query.desde,
        hasta: req.query.hasta
      };

      // Obtener todos los datos en paralelo
      const [ventas, compras, productos, sucursales] = await Promise.all([
        req.apiKey.recursos_permitidos.includes('ventas') ? Pedido.findAll(filters) : [],
        req.apiKey.recursos_permitidos.includes('compras') ? Compra.findAll(filters) : [],
        req.apiKey.recursos_permitidos.includes('productos') ? Product.findAll() : [],
        req.apiKey.recursos_permitidos.includes('sucursales') ? Sucursal.findAll() : []
      ]);

      // Inventario si está permitido
      let inventario = [];
      if (req.apiKey.recursos_permitidos.includes('inventario')) {
        const [inv] = await pool.query(`
          SELECT 
            i.*,
            p.nombre as producto,
            s.nombre as sucursal
          FROM Inventario i
          LEFT JOIN Productos p ON i.id_producto = p.id_producto
          LEFT JOIN Sucursales s ON i.id_sucursal = s.id_sucursal
        `);
        inventario = inv;
      }

      const dataset = {
        source: 'ProClean ERP',
        resource: 'complete_dataset',
        timestamp: new Date().toISOString(),
        filters_applied: filters,
        data: {
          ventas: {
            records: ventas.length,
            data: ventas
          },
          compras: {
            records: compras.length,
            data: compras
          },
          productos: {
            records: productos.length,
            data: productos
          },
          inventario: {
            records: inventario.length,
            data: inventario
          },
          sucursales: {
            records: sucursales.length,
            data: sucursales
          }
        },
        summary: {
          total_resources: 5,
          total_records: ventas.length + compras.length + productos.length + inventario.length + sucursales.length,
          permissions: req.apiKey.recursos_permitidos
        },
        metadata: {
          currency: 'USD',
          timezone: 'UTC',
          exported_by: req.apiKey.organizacion
        }
      };

      res.json(dataset);
    } catch (error) {
      console.error('Error exportando dataset completo:', error);
      res.status(500).json({
        error: 'Error al exportar dataset completo',
        detail: error.message
      });
    }
  }
};

