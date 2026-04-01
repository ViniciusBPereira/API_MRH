import pool from "../../../config/db.js";        // banco LOCAL
import corpPool from "../../../config/corpDb.js"; // banco CORPORATIVO (VPN)

/**
 * ============================
 * BANCO CORPORATIVO
 * ============================
 */

/**
 * Busca TODAS as rondas dos CRs informados
 * ⚠️ SEM filtro incremental
 */
export async function buscarRondasCorp() {
  const query = `
    SELECT
      tarefa.numero AS tarefa_numero,
      LEFT(tarefa.estruturanivel2, 5) AS cr,
      split_part(tarefa.estruturahierarquiadescricao, '/', 5) AS nome_departamento,
      tarefa.nome AS nome_roteiro,
      split_part(tarefa.estruturahierarquiadescricao, '/', 6) AS nome_cliente,
      recurso.nome AS nome_guarda,
      NULL AS numero_dispositivo,
      tarefa.terminoreal AS hora_chegada,
      NULL AS evento,
      NULL AS processing_mode_for_alarm,
      NULL AS remark
    FROM dbo.tarefa
    INNER JOIN dbo.recurso
      ON recurso.codigohash = tarefa.finalizadoporhash
    WHERE
      (
        tarefa.estruturanivel2 LIKE '91826%' OR
        tarefa.estruturanivel2 LIKE '91962%' OR
        tarefa.estruturanivel2 LIKE '91858%'
      )
      AND tarefa.terminoreal >= TIMESTAMP '2026-04-01 00:00:00'
    ORDER BY tarefa.numero
  `;

  const result = await corpPool.query(query);
  return result.rows;
}

/**
 * ============================
 * BANCO LOCAL (UPSERT EM LOTE)
 * ============================
 */

/**
 * Insere / Atualiza rondas em lote
 * (substitui exists + insert + update)
 */
export async function upsertRondasBatch(rondas) {

  if (!rondas || rondas.length === 0) return;

  const CHUNK_SIZE = 1000;

  for (let i = 0; i < rondas.length; i += CHUNK_SIZE) {

    const chunk = rondas.slice(i, i + CHUNK_SIZE);

    const columns = Object.keys(chunk[0]);

    const values = [];
    const placeholders = [];

    chunk.forEach((row, rowIndex) => {

      const rowPlaceholders = columns.map((_, colIndex) => {
        const paramIndex = rowIndex * columns.length + colIndex + 1;
        return `$${paramIndex}`;
      });

      placeholders.push(`(${rowPlaceholders.join(",")})`);

      values.push(...columns.map(col => row[col]));
    });

    const updateSet = columns
      .filter(col => col !== "tarefa_numero")
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(", ");

    const query = `
      INSERT INTO corp_rondas (${columns.join(",")})
      VALUES ${placeholders.join(",")}
      ON CONFLICT (tarefa_numero)
      DO UPDATE SET
      ${updateSet},
      synced_at = now()
    `;

    await pool.query(query, values);

  }

}
