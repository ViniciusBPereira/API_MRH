import pool from "../../../config/db.js";        // banco LOCAL
import corpPool from "../../../config/corpDb.js"; // banco CORPORATIVO (VPN)

/**
 * ============================
 * BANCO CORPORATIVO (INCREMENTAL + ESTÁVEL)
 * ============================
 */
export async function buscarRondasCorp(ultimaData) {

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
    WHERE LEFT(tarefa.estruturanivel2, 5) IN ('91826','91962','91858')
      AND tarefa.terminoreal IS NOT NULL
      AND tarefa.terminoreal > $1

      -- 🔥 evita concorrência com processamento
      AND tarefa.terminoreal < NOW() - INTERVAL '1 day'

    ORDER BY tarefa.terminoreal, tarefa.numero
    LIMIT 100
  `;

  try {

    const start = Date.now();

    const result = await corpPool.query(query, [ultimaData]);

    const duration = Date.now() - start;

    console.log(`⏱ QUERY CORP: ${duration}ms | ${result.rowCount} registros`);

    return result.rows;

  } catch (err) {

    console.warn("⚠️ Erro na query corp (1ª tentativa):", err.message);

    // 🔁 retry controlado
    await new Promise(r => setTimeout(r, 3000));

    try {

      const start = Date.now();

      const result = await corpPool.query(query, [ultimaData]);

      const duration = Date.now() - start;

      console.log(`⏱ QUERY CORP (retry): ${duration}ms | ${result.rowCount} registros`);

      return result.rows;

    } catch (err2) {

      console.error("❌ Falha após retry:", err2.message);
      return []; // evita quebrar o fluxo

    }
  }
}

/**
 * ============================
 * BANCO LOCAL (UPSERT OTIMIZADO)
 * ============================
 */
export async function upsertRondasBatch(rondas) {

  if (!rondas || rondas.length === 0) return;

  const CHUNK_SIZE = 200; // 🔥 reduz pressão no banco local

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
      WHERE corp_rondas.hora_chegada IS DISTINCT FROM EXCLUDED.hora_chegada
    `;

    try {
      await pool.query(query, values);
    } catch (err) {
      console.error("❌ Erro no upsert batch:", err.message);
    }
  }
}
