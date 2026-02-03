import pool from "../../../config/db.js";

/**
 * =====================================================
 * LISTAGEM PARA FRONTEND
 * =====================================================
 * 🔒 Filtrado por CR
 * 📅⏰ Filtro opcional por INTERVALO DATETIME
 * 🧭 Filtro opcional por ROTEIRO (contém)
 */
export async function listarRondas({
  cr,
  dataInicio,
  dataFim,
  horaInicio,
  horaFim,
  roteiro,
  limit = 50,
  offset = 0,
}) {
  const params = [cr];
  const where = ["cr = $1"];

  /**
   * =====================================================
   * INTERVALO DATETIME (CORRETO)
   * =====================================================
   */
  if (dataInicio || dataFim) {
    const dtInicio = dataInicio
      ? `${dataInicio} ${normalizarHora(horaInicio) || "00:00:00"}`
      : "0001-01-01 00:00:00";

    const dtFim = dataFim
      ? `${dataFim} ${normalizarHora(horaFim) || "23:59:59"}`
      : "9999-12-31 23:59:59";

    params.push(dtInicio, dtFim);
    where.push(
      `hora_chegada BETWEEN $${params.length - 1}::timestamp AND $${params.length}::timestamp`,
    );
  }

  /**
   * =====================================================
   * ROTEIRO (CONTÉM)
   * =====================================================
   */
  if (roteiro) {
    params.push(`%${roteiro}%`);
    where.push(`nome_roteiro ILIKE $${params.length}`);
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
    WHERE ${where.join(" AND ")}
    ORDER BY
      hora_chegada DESC,
      tarefa_numero DESC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
    `,
    params,
  );

  return result.rows;
}

/**
 * =====================================================
 * EXPORTAÇÃO CSV (SEM PAGINAÇÃO)
 * =====================================================
 */
export async function listarRondasParaCsv(
  cr,
  dataInicio,
  dataFim,
  horaInicio,
  horaFim,
  roteiro,
) {
  const params = [cr];
  const where = ["cr = $1"];

  if (dataInicio || dataFim) {
    const dtInicio = dataInicio
      ? `${dataInicio} ${normalizarHora(horaInicio) || "00:00:00"}`
      : "0001-01-01 00:00:00";

    const dtFim = dataFim
      ? `${dataFim} ${normalizarHora(horaFim) || "23:59:59"}`
      : "9999-12-31 23:59:59";

    params.push(dtInicio, dtFim);
    where.push(
      `hora_chegada BETWEEN $${params.length - 1}::timestamp AND $${params.length}::timestamp`,
    );
  }

  if (roteiro) {
    params.push(`%${roteiro}%`);
    where.push(`nome_roteiro ILIKE $${params.length}`);
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
    WHERE ${where.join(" AND ")}
    ORDER BY
      hora_chegada DESC,
      tarefa_numero DESC
    `,
    params,
  );

  return result.rows;
}

/**
 * =====================================================
 * NORMALIZA HORA
 * =====================================================
 * Aceita:
 * - HH:mm
 * - HH:mm:ss
 * Retorna sempre HH:mm:ss
 */
function normalizarHora(hora) {
  if (!hora) return null;
  return hora.length === 5 ? `${hora}:00` : hora;
}

/**
 * =====================================================
 * STATUS DE SINCRONIZAÇÃO
 * =====================================================
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
