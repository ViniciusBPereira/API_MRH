import pool from "../../../config/db.js";
import * as repo from "./rondasCorp.repository.js";

/**
 * Garante que a tabela existe
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
    console.warn("⚠️ sync_controle não existe, criando...");
    await garantirTabela();
    return '2026-02-03 00:00:00';
  }
}

/**
 * Salva progresso
 */
async function salvarUltimaData(data) {
  await pool.query(`
    INSERT INTO sync_controle (processo, ultima_data)
    VALUES ('rondas', $1)
    ON CONFLICT (processo)
    DO UPDATE SET ultima_data = $1
  `, [data]);
}

/**
 * Sincronização incremental REAL
 */
export async function sincronizarRondasCorp() {

  console.log("[SERVICE][RONDAS] Sync incremental iniciado");

  try {

    await garantirTabela();

    let ultimaData = await obterUltimaData();

    let loops = 0;
    const MAX_LOOPS = 10; // 🔥 evita loop infinito

    while (loops < MAX_LOOPS) {

      const queryStart = Date.now();

      const rondas = await repo.buscarRondasCorp(ultimaData);

      const queryTime = ((Date.now() - queryStart) / 1000).toFixed(2);

      console.log(
        `[SERVICE][RONDAS] Query ${queryTime}s | ${rondas.length} registros`
      );

      if (rondas.length === 0) {
        console.log("[SERVICE][RONDAS] Sem novos dados");
        break;
      }

      await repo.upsertRondasBatch(rondas);

      ultimaData = rondas[rondas.length - 1].hora_chegada;

      await salvarUltimaData(ultimaData);

      console.log(`[SERVICE][RONDAS] Processados ${rondas.length}`);

      loops++;
    }

  } catch (error) {
    console.error("[SERVICE][RONDAS] ERRO NA SINCRONIZAÇÃO");
    console.error(error.message);
  }
}
