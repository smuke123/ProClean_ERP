import { Router } from 'express';
import { exportController } from '../controllers/exportController.js';
import { 
  authenticateApiKey, 
  requirePermission, 
  requireResource,
  logApiUsage 
} from '../middleware/apiKeyAuth.js';

const router = Router();

/**
 * Todas las rutas de exportación requieren:
 * 1. Autenticación con API Key
 * 2. Logging de uso
 */
router.use(authenticateApiKey);
router.use(logApiUsage);

/**
 * @route   GET /api/export
 * @desc    Información general de la API y recursos disponibles
 * @access  API Key Required
 */
router.get('/', exportController.getApiInfo);

/**
 * @route   GET /api/export/ventas
 * @desc    Exportar datos de ventas/pedidos
 * @access  API Key Required + Resource 'ventas'
 * @query   ?sucursal=1&estado=completado&desde=2025-01-01&hasta=2025-12-31
 */
router.get(
  '/ventas',
  requirePermission('read'),
  requireResource('ventas'),
  exportController.exportVentas
);

/**
 * @route   GET /api/export/compras
 * @desc    Exportar datos de compras
 * @access  API Key Required + Resource 'compras'
 * @query   ?sucursal=1&estado=pagada&desde=2025-01-01&hasta=2025-12-31
 */
router.get(
  '/compras',
  requirePermission('read'),
  requireResource('compras'),
  exportController.exportCompras
);

/**
 * @route   GET /api/export/productos
 * @desc    Exportar catálogo de productos
 * @access  API Key Required + Resource 'productos'
 * @query   ?categoria=Limpieza&marca=ProClean&activo=true
 */
router.get(
  '/productos',
  requirePermission('read'),
  requireResource('productos'),
  exportController.exportProductos
);

/**
 * @route   GET /api/export/inventario
 * @desc    Exportar datos de inventario
 * @access  API Key Required + Resource 'inventario'
 * @query   ?sucursal=1
 */
router.get(
  '/inventario',
  requirePermission('read'),
  requireResource('inventario'),
  exportController.exportInventario
);

/**
 * @route   GET /api/export/sucursales
 * @desc    Exportar información de sucursales
 * @access  API Key Required + Resource 'sucursales'
 */
router.get(
  '/sucursales',
  requirePermission('read'),
  requireResource('sucursales'),
  exportController.exportSucursales
);

/**
 * @route   GET /api/export/all
 * @desc    Exportar dataset completo (todos los datos disponibles según permisos)
 * @access  API Key Required
 * @query   ?desde=2025-01-01&hasta=2025-12-31
 */
router.get(
  '/all',
  requirePermission('read'),
  exportController.exportAll
);

export default router;

