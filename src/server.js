import http from "http";
import express from "express";
import app from "./app.js";
import env from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🔥 Cria servidor HTTP
 */
const server = http.createServer(app);

/**
 * 🔹 Servir frontend
 */
app.use(express.static(path.join(__dirname, "..", "..", "Frontend", "build")));

/**
 * 🔹 Fallback React
 */
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "Frontend", "build", "index.html"),
  );
});

/**
 * 🚀 Start server
 */
server.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
});
