import { Router } from 'express';
import { apiKeyController } from '../controllers/apiKeyController.js';
import { authenticateToken } from '../controllers/authController.js';

const router = Router();

/**
 * Middleware: Verificar que el usuario es administrador
 */
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo los administradores pueden gestionar API Keys'
    });
  }
  next();
};

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   POST /api/api-keys
 * @desc    Crear una nueva API Key
 * @access  Admin only
 */
router.post('/', apiKeyController.createApiKey);

/**
 * @route   GET /api/api-keys
 * @desc    Listar todas las API Keys
 * @access  Admin only
 * @query   ?activa=true&organizacion=nombre
 */
router.get('/', apiKeyController.getAllApiKeys);

/**
 * @route   GET /api/api-keys/:id
 * @desc    Obtener una API Key específica
 * @access  Admin only
 */
router.get('/:id', apiKeyController.getApiKeyById);

/**
 * @route   PATCH /api/api-keys/:id
 * @desc    Activar/Desactivar una API Key
 * @access  Admin only
 * @body    { activa: boolean }
 */
router.patch('/:id', apiKeyController.toggleApiKey);

/**
 * @route   DELETE /api/api-keys/:id
 * @desc    Eliminar una API Key
 * @access  Admin only
 */
router.delete('/:id', apiKeyController.deleteApiKey);

/**
 * @route   GET /api/api-keys/:id/stats
 * @desc    Obtener estadísticas de uso de una API Key
 * @access  Admin only
 * @query   ?desde=2025-01-01&hasta=2025-12-31
 */
router.get('/:id/stats', apiKeyController.getApiKeyStats);

/**
 * @route   GET /api/api-keys/logs/all
 * @desc    Obtener todos los logs de uso de API
 * @access  Admin only
 * @query   ?desde=2025-01-01&hasta=2025-12-31&id_api_key=1&limit=100
 */
router.get('/logs/all', apiKeyController.getAllApiLogs);

export default router;

