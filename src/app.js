import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import "./cron/syncMRH.job.js"; // inicia cron

const app = express();

/* ------------------------------------------------------
   🌍 CORS
------------------------------------------------------ */
app.use(
  cors({
    origin: "*", // ajuste se necessário
    exposedHeaders: ["Authorization"],
  })
);

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
   📁 SERVIR ARQUIVOS DE UPLOADS (ESSENCIAL!)
------------------------------------------------------ */
const uploadsPath = path.resolve("uploads"); // raiz de uploads

app.use("/uploads", express.static(uploadsPath));

/*
 Agora qualquer arquivo salvo em:

   uploads/candidatos/arquivo.pdf

 fica acessível em:

   http://localhost:10555/uploads/candidatos/arquivo.pdf
*/

/* ------------------------------------------------------
   🔀 ROTAS API
------------------------------------------------------ */
app.use("/api", routes);

/* ------------------------------------------------------
   ⚠️ Fallback opcional (caso use React build futuramente)
------------------------------------------------------ */
app.use((req, res) => {
  return res.status(404).json({
    sucesso: false,
    mensagem: "Rota não encontrada.",
  });
});

export default app;
