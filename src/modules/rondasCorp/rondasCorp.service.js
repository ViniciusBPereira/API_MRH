import * as repo from "./rondasCorp.repository.js";

/**
 * Sincroniza rondas do banco corporativo para o banco local
 * Executado via cron (a cada 5 minutos)
 */
export async function sincronizarRondasCorp() {
  console.log("[SERVICE][RONDAS] Iniciando sincronização...");

  try {
    /**
     * 1️⃣ Busca controles de sincronização
     * - last_sync_at: quando o job rodou pela última vez
     * - last_tarefa_numero: até onde os dados foram buscados
     */
    const syncControl = await repo.getSyncControl();
    const lastTarefaNumero = Number(syncControl.last_tarefa_numero) || 0;

    console.log(
      "[SERVICE][RONDAS] Última tarefa sincronizada:",
      lastTarefaNumero,
    );

    /**
     * 2️⃣ Busca rondas no banco corporativo
     * Critério: tarefa.numero > last_tarefa_numero
     */
    console.log("[SERVICE][RONDAS] Buscando dados no banco corporativo...");

    const queryStart = Date.now();
    const rondas = await repo.buscarRondasCorp(lastTarefaNumero);
    const queryTime = ((Date.now() - queryStart) / 1000).toFixed(2);

    console.log(`[SERVICE][RONDAS] Query finalizada em ${queryTime}s`);
    console.log(`[SERVICE][RONDAS] ${rondas.length} registros encontrados`);

    let inseridos = 0;
    let atualizados = 0;
    let maxTarefaNumero = lastTarefaNumero;

    /**
     * 3️⃣ Insert / Update (UPSERT manual)
     */
    for (const ronda of rondas) {
      if (ronda.tarefa_numero > maxTarefaNumero) {
        maxTarefaNumero = ronda.tarefa_numero;
      }

      const existe = await repo.existsByTarefaNumero(ronda.tarefa_numero);

      if (!existe) {
        await repo.insertRonda(ronda);
        inseridos++;
      } else {
        await repo.updateByTarefaNumero(ronda.tarefa_numero, ronda);
        atualizados++;
      }
    }

    /**
     * 4️⃣ Atualiza controles de sincronização
     * - last_sync_at = horário atual (fim da execução)
     * - last_tarefa_numero = maior tarefa processada
     */
    await repo.updateSyncControl({
      lastSyncAt: new Date(),
      lastTarefaNumero: maxTarefaNumero,
    });

    console.log(
      `[SERVICE][RONDAS] Finalizado: +${inseridos} inseridos, ${atualizados} atualizados | last_tarefa_numero=${maxTarefaNumero}`,
    );
  } catch (error) {
    console.error("[SERVICE][RONDAS] ERRO NA SINCRONIZAÇÃO");
    console.error(error);
  }
}
