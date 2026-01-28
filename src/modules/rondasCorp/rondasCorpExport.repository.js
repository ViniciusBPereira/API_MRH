import pool from "../../config/db.js";

/**
 * Busca rondas para listagem
 */
export async function listarRondas({ limit = 50, offset = 0 }) {
  const result = await pool.query(
    `
    SELECT
      tarefa_numero,
      nome_departamento,
      nome_roteiro,
      nome_cliente,
      nome_guarda,
      numero_dispositivo,
      hora_chegada,
      evento,
      processing_mode_for_alarm,
      remark
    FROM corp_rondas
    ORDER BY hora_chegada DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  return result.rows;
}

/**
 * Busca TODAS as rondas para exportação CSV
 */
export async function listarRondasParaCsv() {
  const result = await pool.query(`
    SELECT
      nome_departamento        AS "Nome do Departamento",
      nome_roteiro             AS "Nome do Roteiro",
      nome_cliente             AS "Nome do Cliente",
      nome_guarda              AS "Nome do Guarda",
      numero_dispositivo       AS "Numero do Dispositivo",
      hora_chegada             AS "Hora chegada",
      evento                   AS "Evento",
      processing_mode_for_alarm AS "processing mode for alarm",
      remark                   AS "remark"
    FROM corp_rondas
    ORDER BY hora_chegada
  `);

  return result.rows;
}

/**
 * Retorna informações da última sincronização das rondas
 */
export async function getUltimaSincronizacao() {
  const result = await pool.query(`
    SELECT
      last_sync_at,
      last_tarefa_numero
    FROM sync_control
    WHERE name = 'rondas_corp'
  `);

  return result.rows[0];
}
