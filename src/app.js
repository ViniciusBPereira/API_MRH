import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import "./cron/syncMRH.job.js"; // inicia cron
import "./cron/syncRondasCorpJob.js";

const app = express();

/* ------------------------------------------------------
   🌍 CORS — AJUSTADO PARA PRODUÇÃO
------------------------------------------------------ */
const allowedOrigins = [
  "https://projetosqualidade.site",
  "http://localhost:5173", // Vite (dev)
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // permite chamadas sem origin (Postman, cron, jobs internos)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS bloqueado para a origem: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization", "Content-Disposition"],
  credentials: false, // Bearer Token (não cookies)
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 preflight obrigatório

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
 Exemplo:
 uploads/candidatos/arquivo.pdf
 → https://api.seudominio.com/uploads/candidatos/arquivo.pdf
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
