import pool from "../../../config/db.js";
import * as repo from "./rondasCorp.repository.js";

/**
 * Garante que a tabela de controle existe
 */
async function garantirTabela() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sync_controle (
      processo TEXT PRIMARY KEY,
      ultima_data TIMESTAMP NOT NULL
    );
  `);
}

/**
 * Busca última data processada
 */
async function obterUltimaData() {
  try {
    const result = await pool.query(
      "SELECT ultima_data FROM sync_controle WHERE processo = 'rondas'"
    );

    return result.rows[0]?.ultima_data || '2026-02-03 00:00:00';

  } catch (err) {
    console.warn("⚠️ Erro ao buscar sync_controle, recriando...");
    await garantirTabela();
    return '2026-02-03 00:00:00';
  }
}

/**
 * Salva progresso
 */
async function salvarUltimaData(data) {
  try {
    await pool.query(`
      INSERT INTO sync_controle (processo, ultima_data)
      VALUES ('rondas', $1)
      ON CONFLICT (processo)
      DO UPDATE SET ultima_data = $1
    `, [data]);
  } catch (err) {
    console.error("❌ Erro ao salvar ultima_data:", err.message);
  }
}

/**
 * Sincronização incremental REAL (robusta)
 */
export async function sincronizarRondasCorp() {

  console.log("[SERVICE][RONDAS] Sync incremental iniciado");

  try {

    await garantirTabela();

    let ultimaData = await obterUltimaData();

    let loops = 0;
    const MAX_LOOPS = 10; // 🔥 evita travar ciclo

    while (loops < MAX_LOOPS) {

      const inicio = Date.now();

      let rondas = [];

      try {
        rondas = await repo.buscarRondasCorp(ultimaData);
      } catch (err) {
        console.error("❌ Erro ao buscar rondas:", err.message);
        break; // evita loop quebrado
      }

      const duracao = ((Date.now() - inicio) / 1000).toFixed(2);

      console.log(
        `[SERVICE][RONDAS] Query ${duracao}s | ${rondas.length} registros`
      );

      if (!rondas || rondas.length === 0) {
        console.log("[SERVICE][RONDAS] Sem novos dados");
        break;
      }

      try {
        await repo.upsertRondasBatch(rondas);
      } catch (err) {
        console.error("❌ Erro no upsert:", err.message);
        break;
      }

      /**
       * Atualiza cursor com último registro
       */
      const ultima = rondas[rondas.length - 1];

      if (ultima?.hora_chegada) {
        ultimaData = ultima.hora_chegada;
        await salvarUltimaData(ultimaData);
      } else {
        console.warn("⚠️ Último registro sem hora_chegada, ignorando cursor");
        break;
      }

      console.log(`[SERVICE][RONDAS] Processados ${rondas.length}`);

      loops++;
    }

    if (loops === MAX_LOOPS) {
      console.warn("[SERVICE][RONDAS] Limite de loops atingido");
    }

  } catch (error) {
    console.error("[SERVICE][RONDAS] ERRO NA SINCRONIZAÇÃO");
    console.error(error.message);
  }
}
