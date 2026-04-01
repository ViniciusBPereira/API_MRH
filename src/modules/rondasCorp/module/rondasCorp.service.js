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
      `[SERVICE][RONDAS] Query finalizada em ${queryTime}s | ${rondas.length} registros encontrados`
    );

    /**
     * 2️⃣ UPSERT em lote no banco local
     */
    const upsertStart = Date.now();

    await repo.upsertRondasBatch(rondas);

    const upsertTime = ((Date.now() - upsertStart) / 1000).toFixed(2);

    console.log(
      `[SERVICE][RONDAS] Sincronização concluída | ${rondas.length} registros processados em ${upsertTime}s`
    );

  } catch (error) {
    console.error("[SERVICE][RONDAS] ERRO NA SINCRONIZAÇÃO");
    console.error(error);
  }
}
