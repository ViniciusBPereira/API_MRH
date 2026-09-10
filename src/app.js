import "./modules/emae/emae.push.monitor.js";
import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import "./cron/syncMRH.job.js"; // inicia cron
import "./cron/syncRondasCorpJob.js";

const app = express();

/* ------------------------------------------------------
   ðŸŒ CORS
------------------------------------------------------ */
app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Authorization", "Content-Disposition"],
  }),
);

/* ------------------------------------------------------
   ðŸ“¦ JSON PARSER
------------------------------------------------------ */
app.use(express.json());

/* ------------------------------------------------------
   â— TRATAR JSON INVÃLIDO
------------------------------------------------------ */
app.use((err, req, res, next) => {
  // ðŸ”’ SÃ³ valida JSON em mÃ©todos que realmente usam body
  const methodsWithBody = ["POST", "PUT", "PATCH"];

  if (
    methodsWithBody.includes(req.method) &&
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "JSON invÃ¡lido: verifique a sintaxe.",
    });
  }

  next(err);
});

const uploadsPath = path.resolve("uploads"); // raiz de uploads

app.use("/uploads", express.static(uploadsPath));

/* ------------------------------------------------------
   ðŸ”€ ROTAS API
------------------------------------------------------ */
app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).json({
    sucesso: false,
    mensagem: "Rota nÃ£o encontrada.",
  });
});

export default app;

