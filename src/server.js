import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";
import { initSocket } from "./socket.js";
import { startNPSScheduler } from "./modules/nps/nps.scheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🔥 AQUI MUDA: cria servidor HTTP
 */
const server = http.createServer(app);

/**
 * 🔌 Socket.IO
 */
const io = initSocket(server);

/**
 * ⏱️ Scheduler NPS
 */
startNPSScheduler(io);

/**
 * 🔹 Servir frontend (mantido igual)
 */
app.use(
  express.static(
    path.join(__dirname, "..", "..", "Frontend", "build")
  )
);

/**
 * 🔹 Fallback React (mantido igual)
 */
app.get(/^\/(?!api).*/, (req, res) => {
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

/**
 * 🚀 Start server
 */
server.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
});