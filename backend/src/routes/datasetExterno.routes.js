import { Router } from 'express';
import datasetExternoController from '../controllers/datasetExternoController.js';
import { authenticateToken, requireRole } from '../controllers/authController.js';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authenticateToken);

/**
 * @route   GET /api/datasets-externos
 * @desc    Listar todos los datasets importados
 * @access  Autenticado
 * @query   ?activo=true&empresa=nombre
 */
router.get('/', datasetExternoController.getAll);

/**
 * @route   GET /api/datasets-externos/:id
 * @desc    Obtener información de un dataset específico
 * @access  Autenticado
 */
router.get('/:id', datasetExternoController.getById);

/**
 * @route   GET /api/datasets-externos/:id/datos
 * @desc    Obtener los datos de un dataset
 * @access  Autenticado
 * @query   ?limit=1000&offset=0
 */
router.get('/:id/datos', datasetExternoController.getDatos);

/**
 * @route   POST /api/datasets-externos/importar
 * @desc    Importar un nuevo dataset desde JSON
 * @access  Admin
 * @body    { nombre_empresa, descripcion?, datos: [], metadata? }
 */
router.post('/importar', requireRole('admin'), datasetExternoController.importar);

/**
 * @route   PUT /api/datasets-externos/:id
 * @desc    Actualizar información de un dataset
 * @access  Admin
 * @body    { nombre_empresa?, descripcion?, activo?, metadata? }
 */
router.put('/:id', requireRole('admin'), datasetExternoController.actualizar);

/**
 * @route   PUT /api/datasets-externos/:id/datos
 * @desc    Reemplazar los datos de un dataset
 * @access  Admin
 * @body    { datos: [] }
 */
router.put('/:id/datos', requireRole('admin'), datasetExternoController.reemplazarDatos);

/**
 * @route   DELETE /api/datasets-externos/:id
 * @desc    Eliminar un dataset completo
 * @access  Admin
 */
router.delete('/:id', requireRole('admin'), datasetExternoController.eliminar);

export default router;

