import express from "express";
import app from "./app.js";
import env from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Servir frontend somente fora de /api/**
app.use(express.static(path.join(__dirname, "..", "..", "Frontend", "build")));

// 🔹 Qualquer rota que NÃO comece com /api cai aqui
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "Frontend", "build", "index.html")
  );
});

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
});
