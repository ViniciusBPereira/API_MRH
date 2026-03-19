import { sincronizarRondasCorp } from "../modules/rondasCorp/module/rondasCorp.service.js";

/**
 * Intervalo fixo de 5 minutos
 */
const INTERVALO = 5 * 60 * 1000; // 300000 ms

/**
 * Sleep utilitário
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Worker contínuo controlado por tempo fixo
 */
async function executarRondasLoop() {

  console.log("[WORKER][RONDAS] Worker iniciado (intervalo: 5 minutos)");

  while (true) {

    console.log("[WORKER][RONDAS] Iniciando sincronização...");

    const inicioCiclo = Date.now();

    try {

      const start = Date.now();

      await sincronizarRondasCorp();

      const duration = ((Date.now() - start) / 1000).toFixed(2);

      console.log(`[WORKER][RONDAS] Finalizado em ${duration}s`);

    } catch (error) {

      console.error("[WORKER][RONDAS] ERRO:", error);

    }

    /**
     * Garante que sempre espere 5 minutos entre execuções
     * (descontando o tempo que já levou pra executar)
     */
    const tempoExecucao = Date.now() - inicioCiclo;
    const tempoRestante = INTERVALO - tempoExecucao;

    if (tempoRestante > 0) {
      console.log(
        `[WORKER][RONDAS] Aguardando ${(tempoRestante / 1000).toFixed(0)}s para próxima execução\n`
      );
      await sleep(tempoRestante);
    } else {
      console.warn(
        "[WORKER][RONDAS] Execução demorou mais que 5 minutos, iniciando próximo ciclo imediatamente\n"
      );
    }

  }

}

/**
 * Inicializa worker
 */
executarRondasLoop();;
