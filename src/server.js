import express from "express";
import app from "./app.js";
import env from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

/* ✅ AQUI ESTÁ O AJUSTE */
server.use(app); // monta TODAS as rotas /api antes do frontend

// 🔹 Servir frontend somente fora de /api/**
server.use(
  express.static(
    path.join(__dirname, "..", "..", "Frontend", "build")
  )
);

// 🔹 Qualquer rota que NÃO comece com /api cai aqui
server.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "..",
      "..",
      "Frontend",
      "build",
      "index.html"
    )
  );
});

server.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
});
