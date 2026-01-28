import cron from "node-cron";
import { sincronizarRondasCorp } from "../modules/rondasCorp/rondasCorp.service.js";

cron.schedule("*/10 * * * *", async () => {
  console.log("[CRON] Executando sincronização RONDAS CORP...");

  try {
    await sincronizarRondasCorp();
  } catch (error) {
    console.error("[CRON] Erro RONDAS CORP:", error.message);
  }
});
