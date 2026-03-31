import { sincronizarRondasCorp } from "../modules/rondasCorp/module/rondasCorp.service.js";

/**
 * Intervalo de execução (quase tempo real)
 */
const INTERVALO = 60 * 1000; // 1 minuto

/**
 * Controle de concorrência
 */
let emExecucao = false;

/**
 * Sleep utilitário
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Worker contínuo controlado
 */
async function executarRondasLoop() {

  console.log("[WORKER][RONDAS] Worker iniciado (intervalo: 1 minuto)");

  while (true) {

    /**
     * Evita execução concorrente
     */
    if (emExecucao) {
      console.warn("[WORKER][RONDAS] Execução ainda em andamento, aguardando...");
      await sleep(5000); // espera 5s e tenta de novo
      continue;
    }

    emExecucao = true;

    console.log("[WORKER][RONDAS] Iniciando sincronização...");

    const inicioCiclo = Date.now();

    try {

      const start = Date.now();

      await sincronizarRondasCorp();

      const duration = ((Date.now() - start) / 1000).toFixed(2);

      console.log(`[WORKER][RONDAS] Finalizado em ${duration}s`);

    } catch (error) {

      console.error("[WORKER][RONDAS] ERRO:", error);

    } finally {
      emExecucao = false;
    }

    /**
     * Garante intervalo fixo real
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
        "[WORKER][RONDAS] Execução demorou mais que o intervalo, reiniciando imediatamente\n"
      );
    }

  }

}

/**
 * Inicializa worker
 */
executarRondasLoop();
