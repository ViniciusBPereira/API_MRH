import { buscarNPS } from "./nps.service.js";
import { detectarNovasNPS } from "./nps.cache.js";

/**
 * Inicia o scheduler de NPS
 * @param {object} io - instância do Socket.IO (opcional)
 */
export function startNPSScheduler(io = null) {
  console.log("[SCHEDULER] Iniciado - rodando a cada 2 minutos");

  setInterval(async () => {
    console.log("[SCHEDULER] Executando coleta...");

    try {
      const dados = await buscarNPS();

      console.log(`[SCHEDULER] Total coletado: ${dados.length}`);

      const novas = detectarNovasNPS(dados);

      /**
       * Se houver novas NPS
       */
      if (novas.length > 0) {
        console.log(`[SCHEDULER] Novas NPS: ${novas.length}`);

        /**
         * Log detalhado
         */
        novas.forEach((nps) => {
          console.log(
            `[NOVA NPS] Cliente: ${nps.nome_respondente} | Nota: ${nps.nota}`
          );
        });

        /**
         * Disparo via socket (se existir)
         */
        if (io) {
          io.emit("nova-nps", novas);
          console.log("[SCHEDULER] Evento enviado via socket");
        }
      } else {
        console.log("[SCHEDULER] Nenhuma nova NPS");
      }

    } catch (error) {
      console.error("[SCHEDULER] Erro:", error.message);
    }

  }, 120000); // 2 minutos
}