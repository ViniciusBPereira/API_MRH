import express from "express";
import app from "./app.js";
import env from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";

/* ✅ IMPORTA O CRON NO STARTUP DO SERVIDOR */
import "./cron/rondasCron.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

/* ================= API ================= */
server.use(app); // monta todas as rotas /api antes do frontend

/* ================= FRONTEND ================= */
server.use(
  express.static(path.join(__dirname, "..", "..", "Frontend", "build"))
);

/* qualquer rota que NÃO comece com /api vai para o React */
server.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "Frontend", "build", "index.html")
  );
});

/* ================= START SERVER ================= */
server.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
});
