import * as repo from "./rondasCorp.repository.js";

/**
 * Sincroniza TODAS as rondas do banco corporativo para o banco local
 * Executado via cron
 * ⚠️ SEM controle incremental
 */
export async function sincronizarRondasCorp() {
  console.log("[SERVICE][RONDAS] Iniciando sincronização completa...");

  try {
    /**
     * 1️⃣ Busca TODAS as rondas no banco corporativo
     */
    console.log("[SERVICE][RONDAS] Buscando dados no banco corporativo...");

    const queryStart = Date.now();
    const rondas = await repo.buscarRondasCorp();
    const queryTime = ((Date.now() - queryStart) / 1000).toFixed(2);

    console.log(
      `[SERVICE][RONDAS] Query finalizada em ${queryTime}s | ${rondas.length} registros encontrados`,
    );

    let inseridos = 0;
    let atualizados = 0;

    /**
     * 2️⃣ Insert / Update (UPSERT manual)
     */
    for (const ronda of rondas) {
      const existe = await repo.existsByTarefaNumero(ronda.tarefa_numero);

      if (!existe) {
        await repo.insertRonda(ronda);
        inseridos++;
      } else {
        await repo.updateByTarefaNumero(ronda.tarefa_numero, ronda);
        atualizados++;
      }
    }

    console.log(
      `[SERVICE][RONDAS] Sincronização concluída: +${inseridos} inseridos, ${atualizados} atualizados`,
    );
  } catch (error) {
    console.error("[SERVICE][RONDAS] ERRO NA SINCRONIZAÇÃO");
    console.error(error);
  }
}
