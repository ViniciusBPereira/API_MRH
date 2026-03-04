import { sincronizarRondasCorp } from "../modules/rondasCorp/module/rondasCorp.service.js";

/**
 * Pequena função de pausa para evitar loop agressivo
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Worker contínuo
 * Executa uma sincronização logo após a anterior terminar
 */
async function executarRondasLoop() {

  while (true) {

    console.log("[WORKER][RONDAS] Iniciando sincronização...");

    try {

      const start = Date.now();

      await sincronizarRondasCorp();

      const duration = ((Date.now() - start) / 1000).toFixed(2);

      console.log(`[WORKER][RONDAS] Finalizado em ${duration}s`);

    } catch (error) {

      console.error("[WORKER][RONDAS] ERRO:", error);

    }

    /**
     * Pequeno respiro para não saturar banco/API
     */
    await sleep(2000);

  }

}

/**
 * Inicia worker
 */
executarRondasLoop();
