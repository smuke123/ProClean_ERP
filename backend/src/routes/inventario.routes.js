import { Router } from "express";
import { inventarioController } from "../controllers/inventarioController.js";

const router = Router();

// Rutas de inventario
router.put("/set", inventarioController.setStock);

export default router;