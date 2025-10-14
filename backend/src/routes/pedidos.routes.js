import { Router } from "express";
import { pedidoController } from "../controllers/pedidoController.js";

const router = Router();

// Rutas de pedidos
router.post("/", pedidoController.createPedido);
router.put("/:id/estado", pedidoController.updateEstado);
router.get("/", pedidoController.getAllPedidos);
router.get("/:id", pedidoController.getPedidoById);

export default router;