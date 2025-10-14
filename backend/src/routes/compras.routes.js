import { Router } from "express";
import { compraController } from "../controllers/compraController.js";

const router = Router();

// Rutas de compras
router.post("/", compraController.createCompra);
router.get("/", compraController.getAllCompras);
router.get("/:id", compraController.getCompraById);

export default router;