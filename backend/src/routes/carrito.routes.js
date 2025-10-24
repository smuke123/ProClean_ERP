import { Router } from "express";
import { carritoController } from "../controllers/carritoController.js";
import { authenticateToken } from "../controllers/authController.js";

const router = Router();

// Todas las rutas del carrito requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/carrito
 * @desc    Obtener el carrito completo del usuario autenticado
 * @access  Private
 */
router.get("/", carritoController.getCarrito);

/**
 * @route   GET /api/carrito/summary
 * @desc    Obtener resumen del carrito (solo totales)
 * @access  Private
 */
router.get("/summary", carritoController.getSummary);

/**
 * @route   POST /api/carrito
 * @desc    Agregar un producto al carrito
 * @access  Private
 * @body    { id_producto: number, cantidad?: number }
 */
router.post("/", carritoController.addItem);

/**
 * @route   POST /api/carrito/sync
 * @desc    Sincronizar carrito desde localStorage
 * @access  Private
 * @body    { items: Array<{id_producto: number, cantidad: number}> }
 */
router.post("/sync", carritoController.syncCarrito);

/**
 * @route   PUT /api/carrito/:id_producto
 * @desc    Actualizar la cantidad de un producto
 * @access  Private
 * @body    { cantidad: number }
 */
router.put("/:id_producto", carritoController.updateQuantity);

/**
 * @route   DELETE /api/carrito/:id_producto
 * @desc    Eliminar un producto del carrito
 * @access  Private
 */
router.delete("/:id_producto", carritoController.removeItem);

/**
 * @route   DELETE /api/carrito
 * @desc    Limpiar todo el carrito
 * @access  Private
 */
router.delete("/", carritoController.clearCarrito);

export default router;

