import pool from "../../../config/db.js"; // banco LOCAL
import corpPool from "../../../config/corpDb.js"; // banco CORPORATIVO (VPN)

/**
 * ============================
 * BANCO CORPORATIVO
 * ============================
 */

/**
 * Busca rondas de forma incremental
 * - Busca múltiplos CRs
 * - Extrai o CR para persistência local
 */
export async function buscarRondasCorp(lastTarefaNumero) {
  const query = `
    SELECT
      tarefa.numero AS tarefa_numero,
      LEFT(tarefa.estruturanivel2, 5) AS cr,
      split_part(tarefa.estruturahierarquiadescricao, '/', 5)
        AS nome_departamento,
      tarefa.nome AS nome_roteiro,
      split_part(tarefa.estruturahierarquiadescricao, '/', 6)
        AS nome_cliente,
      recurso.nome AS nome_guarda,
      NULL AS numero_dispositivo,
      tarefa.terminoreal AS hora_chegada,
      NULL AS evento,
      NULL AS processing_mode_for_alarm,
      NULL AS remark
    FROM dbo.tarefa
    INNER JOIN dbo.recurso
      ON recurso.codigohash = tarefa.finalizadoporhash
    WHERE LEFT(tarefa.estruturanivel2, 5) IN ('91826', '91962')
     -- AND tarefa.numero > $1
    ORDER BY tarefa.numero
  `;

  const result = await corpPool.query(query, [lastTarefaNumero]);
  return result.rows;
}

/**
 * ============================
 * CONTROLE DE SINCRONIZAÇÃO
 * ============================
 */

/**
 * Retorna os controles de sincronização
 */
export async function getSyncControl() {
  const result = await pool.query(`
    SELECT last_sync_at, last_tarefa_numero
    FROM sync_control
    WHERE name = 'rondas_corp'
  `);

  return result.rows[0];
}

/**
 * Atualiza controles de sincronização
 */
export async function updateSyncControl({ lastSyncAt, lastTarefaNumero }) {
  await pool.query(
    `
      UPDATE sync_control
      SET last_sync_at = $1,
          last_tarefa_numero = $2
      WHERE name = 'rondas_corp'
    `,
    [lastSyncAt, lastTarefaNumero],
  );
}

/**
 * ============================
 * BANCO LOCAL (UPSERT)
 * ============================
 */

/**
 * Verifica se a ronda já existe
 */
export async function existsByTarefaNumero(tarefaNumero) {
  const result = await pool.query(
    `
      SELECT 1
      FROM corp_rondas
      WHERE tarefa_numero = $1
      LIMIT 1
    `,
    [tarefaNumero],
  );

  return result.rowCount > 0;
}

/**
 * Insere nova ronda
 * - data já contém o CR
 */
export async function insertRonda(data) {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO corp_rondas (${columns.join(", ")})
    VALUES (${placeholders})
  `;

  await pool.query(query, values);
}

/**
 * Atualiza ronda existente
 */
export async function updateByTarefaNumero(tarefaNumero, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);

  if (keys.length === 0) return;

  const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    UPDATE corp_rondas
    SET ${sets},
        synced_at = now()
    WHERE tarefa_numero = $${keys.length + 1}
  `;

  await pool.query(query, [...values, tarefaNumero]);
}
