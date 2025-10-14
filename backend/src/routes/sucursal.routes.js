import { Router } from "express";
import { sucursalController } from "../controllers/sucursalController.js";

const router = Router();

// Rutas de sucursales
router.get("/", sucursalController.getAllSucursales);
router.get("/:id/inventario", sucursalController.getInventarioBySucursal);

export default router;

