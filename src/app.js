import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import "./cron/syncMRH.job.js"; // inicia cron
import "./cron/syncRondasCorpJob.js";

const app = express();

/* ------------------------------------------------------
   🌍 CORS — BASE SEGURA (ANTES DO NGINX)
   👉 Funciona local, produção e Postman
------------------------------------------------------ */
app.use(
  cors({
    origin: true, // 🔥 reflete a Origin automaticamente
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization", "Content-Disposition"],
    credentials: false, // Bearer Token (não cookies)
  }),
);

/* Preflight */
app.options("*", cors());

/* ------------------------------------------------------
   📦 JSON PARSER
------------------------------------------------------ */
app.use(express.json());

/* ------------------------------------------------------
   ❗ TRATAR JSON INVÁLIDO
------------------------------------------------------ */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "JSON inválido: verifique a sintaxe.",
    });
  }
  next();
});

/* ------------------------------------------------------
   📁 SERVIR ARQUIVOS DE UPLOADS
------------------------------------------------------ */
const uploadsPath = path.resolve("uploads");

app.use("/uploads", express.static(uploadsPath));

/*
 uploads/candidatos/arquivo.pdf
 → http://localhost:10555/uploads/candidatos/arquivo.pdf
*/

/* ------------------------------------------------------
   🔀 ROTAS API
------------------------------------------------------ */
app.use("/api", routes);

/* ------------------------------------------------------
   ⚠️ FALLBACK 404
------------------------------------------------------ */
app.use((req, res) => {
  return res.status(404).json({
    sucesso: false,
    mensagem: "Rota não encontrada.",
  });
});

export default app;
