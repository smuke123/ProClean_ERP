import express from "express";
import pool from "./config/database.js";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import sucursalRoutes from "./routes/sucursal.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";
import comprasRoutes from "./routes/compras.routes.js";
import pedidosRoutes from "./routes/pedidos.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";

const app = express();
app.use(cors()); // habilita CORS
app.use(express.json());

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW()");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// app.use('/api', userRoutes); // Descomentar cuando funcione

// API
app.use("/api/products", productRoutes);
app.use("/api/sucursales", sucursalRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/compras", comprasRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/proveedores", proveedoresRoutes);

export default app;
