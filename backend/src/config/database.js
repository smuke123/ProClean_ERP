import { createPool } from "mysql2/promise";
import { config } from "dotenv";
config();

const pool = createPool({
  host: process.env.MYSQLDB_HOST,
  user: process.env.MYSQLDB_USER,
  password: process.env.MYSQLDB_PASSWORD,
  port: process.env.MYSQLDB_DOCKER_PORT,
  database: process.env.MYSQLDB_DATABASE,
});

export default pool;
