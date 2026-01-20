import cron from "node-cron";
import { sincronizarMRHs } from "../modules/mrhs/mrhs.service.js";

cron.schedule("*/5 * * * *", async () => {
  console.log("[CRON] Executando sincronização MRH...");

  try {
    await sincronizarMRHs();
  } catch (error) {
    console.error("[CRON] Erro:", error.message);
  }
});
