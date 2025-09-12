import express from "express";
import { createPool } from 'mysql2/promise';
import {config} from 'dotenv';
config();

const app = express();

const pool = createPool({
  host: process.env.MYSQLDB_HOST,
  user: process.env.MYSQLDB_USER,
  password: process.env.MYSQLDB_PASSWORD,
  port: process.env.MYSQLDB_DOCKER_PORT,
  database: process.env.MYSQLDB_DATABASE,
});

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


const PORT = process.env.NODE_DOCKER_PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});