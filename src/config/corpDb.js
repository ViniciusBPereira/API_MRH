import pkg from "pg";
import env from "./env.js";

const { Pool } = pkg;

const corpPool = new Pool({
  host: env.CORP_DB_HOST,
  port: env.CORP_DB_PORT,
  user: env.CORP_DB_USER,
  password: env.CORP_DB_PASS,
  database: env.CORP_DB_NAME,
  ssl: false,

  max: 2, // 🔥 evita sobrecarregar VPN
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 1200000, // 🔥 tempo pra conectar (10s)

  keepAlive: true, // 🔥 essencial pra VPN
});

export default corpPool;
