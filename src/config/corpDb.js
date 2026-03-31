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

  max: 3, // 🔥 reduz pressão na VPN

 // 🔥 TIMEOUTS AJUSTADOS
  connectionTimeoutMillis: 300000, // 5 minutos
  statement_timeout: 300000,       // 5 minutos
  query_timeout: 300000,           // 5 minutos


  idleTimeoutMillis: 30000,
});

export default corpPool;
