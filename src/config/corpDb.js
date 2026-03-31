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
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // 30s
  statement_timeout: 60000,       // 60s
  query_timeout: 60000,
});

export default corpPool;
