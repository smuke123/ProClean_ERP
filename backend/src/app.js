import express from "express";
import pool from "./config/database.js";
// import userRoutes from "./routes/user.routes.js"; // Descomentar cuando tenga rutas

const app = express();
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

export default app;
