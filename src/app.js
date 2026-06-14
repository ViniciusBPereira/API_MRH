import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import "./cron/syncMRH.job.js"; // inicia cron
import "./cron/syncRondasCorpJob.js";

const app = express();

/* ------------------------------------------------------
   🌍 CORS
------------------------------------------------------ */
app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Authorization", "Content-Disposition"],
  }),
);

/* ------------------------------------------------------
   📦 JSON PARSER
------------------------------------------------------ */
app.use(express.json());

/* ------------------------------------------------------
   ❗ TRATAR JSON INVÁLIDO
------------------------------------------------------ */
app.use((err, req, res, next) => {
  // 🔒 Só valida JSON em métodos que realmente usam body
  const methodsWithBody = ["POST", "PUT", "PATCH"];

  if (
    methodsWithBody.includes(req.method) &&
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "JSON inválido: verifique a sintaxe.",
    });
  }

  next(err);
});

const uploadsPath = path.resolve("uploads"); // raiz de uploads

app.use("/uploads", express.static(uploadsPath));

/* ------------------------------------------------------
   🔀 ROTAS API
------------------------------------------------------ */
app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).json({
    sucesso: false,
    mensagem: "Rota não encontrada.",
  });
});

export default app;
