import { Router } from "express";
import { proveedorController } from "../controllers/proveedorController.js";

const router = Router();

// Rutas de proveedores
router.get("/", proveedorController.getAllProveedores);
router.get("/:id", proveedorController.getProveedorById);
router.post("/", proveedorController.createProveedor);
router.put("/:id", proveedorController.updateProveedor);
router.delete("/:id", proveedorController.deleteProveedor);

export default router;


