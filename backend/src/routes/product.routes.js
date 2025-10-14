import { Router } from "express";
import { productController } from "../controllers/productController.js";

const router = Router();

// Rutas de productos
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;