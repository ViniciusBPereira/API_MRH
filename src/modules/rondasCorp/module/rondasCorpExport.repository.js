import pool from "../../../config/db.js";

/**
 * Busca rondas para listagem
 * 🔒 FILTRADO PELO CR DO PERFIL
 * 📅 FILTRO OPCIONAL POR DATA (hora_chegada)
 * 🧭 FILTRO OPCIONAL POR ROTEIRO (contém)
 */
export async function listarRondas({
  cr,
  dataInicio,
  dataFim,
  roteiro,
  limit = 50,
  offset = 0,
}) {
  const params = [cr];
  let whereClause = "WHERE cr = $1";

  if (dataInicio) {
    params.push(`${dataInicio} 00:00:00`);
    whereClause += ` AND hora_chegada >= $${params.length}`;
  }

  if (dataFim) {
    params.push(`${dataFim} 23:59:59`);
    whereClause += ` AND hora_chegada <= $${params.length}`;
  }

  if (roteiro) {
    params.push(`%${roteiro}%`);
    whereClause += ` AND nome_roteiro ILIKE $${params.length}`;
  }

  params.push(limit, offset);

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
    ${whereClause}
    ORDER BY hora_chegada DESC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
    `,
    params,
  );

  return result.rows;
}

/**
 * Busca TODAS as rondas para exportação CSV
 * 🔒 FILTRADO PELO CR DO PERFIL
 * 📅 FILTRO OPCIONAL POR DATA (hora_chegada)
 * 🧭 FILTRO OPCIONAL POR ROTEIRO (contém)
 */
export async function listarRondasParaCsv(cr, dataInicio, dataFim, roteiro) {
  const params = [cr];
  let whereClause = "WHERE cr = $1";

  if (dataInicio) {
    params.push(`${dataInicio} 00:00:00`);
    whereClause += ` AND hora_chegada >= $${params.length}`;
  }

  if (dataFim) {
    params.push(`${dataFim} 23:59:59`);
    whereClause += ` AND hora_chegada <= $${params.length}`;
  }

  if (roteiro) {
    params.push(`%${roteiro}%`);
    whereClause += ` AND nome_roteiro ILIKE $${params.length}`;
  }

  const result = await pool.query(
    `
    SELECT
      nome_departamento         AS "Nome do Departamento",
      nome_roteiro              AS "Nome do Roteiro",
      nome_cliente              AS "Nome do Cliente",
      nome_guarda               AS "Nome do Guarda",
      numero_dispositivo        AS "Numero do Dispositivo",
      hora_chegada              AS "Hora chegada",
      evento                    AS "Evento",
      processing_mode_for_alarm AS "processing mode for alarm",
      remark                    AS "remark"
    FROM corp_rondas
    ${whereClause}
    ORDER BY hora_chegada
    `,
    params,
  );

  return result.rows;
}

/**
 * Retorna informações da última sincronização das rondas
 * (controle global, NÃO filtra por CR)
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
