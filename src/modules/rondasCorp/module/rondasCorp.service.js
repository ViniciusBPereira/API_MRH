import * as repo from "./rondasCorp.repository.js";

/**
 * Sincronização diária (reprocessa o dia inteiro)
 */
export async function sincronizarRondasCorp() {

  console.log("[SERVICE][RONDAS] Sync diário iniciado");

  try {

    const inicio = Date.now();

    let rondas = [];

    try {
      rondas = await repo.buscarRondasCorp();
    } catch (err) {
      console.error("❌ Erro ao buscar rondas:", err.message);
      return;
    }

    const duracao = ((Date.now() - inicio) / 1000).toFixed(2);

    console.log(
      `[SERVICE][RONDAS] Query ${duracao}s | ${rondas.length} registros`
    );

    if (!rondas || rondas.length === 0) {
      console.log("[SERVICE][RONDAS] Sem dados para processar");
      return;
    }

    try {
      await repo.upsertRondasBatch(rondas);
    } catch (err) {
      console.error("❌ Erro no upsert:", err.message);
      return;
    }

    console.log(`[SERVICE][RONDAS] Processados ${rondas.length}`);

  } catch (error) {
    console.error("[SERVICE][RONDAS] ERRO NA SINCRONIZAÇÃO");
    console.error(error.message);
  }
}
