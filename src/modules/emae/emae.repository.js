import corpPool from "../../config/corpDb.js";

class EmaeRepository {
  // ============================================================
  // PONTOS DE RONDA / GEOLOCALIZAÇÃO
  // ============================================================
  async getMapPoints(cr) {
    const sql = `
      WITH coordenadas AS (
        SELECT DISTINCT
          tarefa.id AS tarefa_id,
          TRIM(tarefa.estruturadescricao) AS ponto,
          execucao.latitude::double precision AS latitude,
          execucao.longitude::double precision AS longitude

        FROM dbo.tarefa

        INNER JOIN dbo.execucao
          ON execucao.tarefaid = tarefa.id

        WHERE
          LEFT(tarefa.estruturanivel2, 5) = $1

          AND tarefa.status = 85

          AND tarefa.nome LIKE '%RONDA%'

          AND tarefa.estruturadescricao IS NOT NULL

          AND execucao.latitude IS NOT NULL
          AND execucao.longitude IS NOT NULL

          AND execucao.latitude <> 0
          AND execucao.longitude <> 0

          AND execucao.latitude BETWEEN -90 AND 90
          AND execucao.longitude BETWEEN -180 AND 180

          AND tarefa.terminoreal >=
            (
              NOW() AT TIME ZONE 'America/Sao_Paulo'
            ) - INTERVAL '90 days'
      )

      SELECT
        ponto,

        AVG(latitude)::double precision AS latitude,
        AVG(longitude)::double precision AS longitude,

        COUNT(*)::integer AS amostras

      FROM coordenadas

      GROUP BY ponto

      ORDER BY ponto;
    `;

    const { rows } =
      await corpPool.query(
        sql,
        [cr],
      );

    return rows;
  }

  // ============================================================
  // JANELAS DE RONDA
  // ============================================================
  //
  // IMPORTANTE:
  //
  // disponibilizacao_chave:
  //   permanece exatamente como está no banco para localizar
  //   novamente as tarefas daquela janela.
  //
  // disponibilizacao / prazo:
  //   são convertidos de America/Sao_Paulo para TIMESTAMPTZ.
  //   Assim Node + navegador não deslocam -3 horas em produção.
  // ============================================================
  async getRoundWindows(cr) {
    const sql = `
      SELECT DISTINCT
        tarefa.nome,

        TO_CHAR(
          tarefa.disponibilizacao,
          'YYYY-MM-DD HH24:MI:SS'
        ) AS disponibilizacao_chave,

        tarefa.disponibilizacao
          AT TIME ZONE 'America/Sao_Paulo'
          AS disponibilizacao,

        tarefa.prazo
          AT TIME ZONE 'America/Sao_Paulo'
          AS prazo

      FROM dbo.tarefa

      WHERE
        LEFT(tarefa.estruturanivel2, 5) = $1

        AND tarefa.nome LIKE '%RONDA%'

        AND tarefa.disponibilizacao <=
          NOW() AT TIME ZONE 'America/Sao_Paulo'

        AND tarefa.disponibilizacao >=
          (
            NOW() AT TIME ZONE 'America/Sao_Paulo'
          ) - INTERVAL '24 hours'

      ORDER BY
        disponibilizacao DESC;
    `;

    const { rows } =
      await corpPool.query(
        sql,
        [cr],
      );

    return rows;
  }

  // ============================================================
  // TAREFAS DA JANELA DE RONDA
  // ============================================================
  async getRounds(
    cr,
    disponibilizacao,
  ) {
    const sql = `
      SELECT
        tarefa.id,
        tarefa.status,
        tarefa.numero,
        tarefa.nome,

        tarefa.disponibilizacao
          AT TIME ZONE 'America/Sao_Paulo'
          AS disponibilizacao,

        tarefa.prazo
          AT TIME ZONE 'America/Sao_Paulo'
          AS prazo,

        tarefa.terminoreal
          AT TIME ZONE 'America/Sao_Paulo'
          AS terminoreal,

        TRIM(
          tarefa.estruturadescricao
        ) AS estruturadescricao,

        tarefa.expirada,

        recurso.nome AS vigilante,

        'https://apiprod.gpsvista.com.br/api/relatorio/tarefa?tarefaId='
          || tarefa.id::text AS pdf

      FROM dbo.tarefa

      LEFT JOIN dbo.recurso
        ON recurso.codigohash =
          tarefa.finalizadoporhash

      WHERE
        LEFT(tarefa.estruturanivel2, 5) = $1

        AND tarefa.nome LIKE '%RONDA%'

        AND tarefa.disponibilizacao =
          $2::timestamp

      ORDER BY
        tarefa.estruturadescricao;
    `;

    const { rows } =
      await corpPool.query(
        sql,
        [
          cr,
          disponibilizacao,
        ],
      );

    return rows;
  }

  // ============================================================
  // OCORRÊNCIAS
  // ============================================================
  //
  // Abertas:
  //   permanecem disponíveis para acompanhamento.
  //
  // Finalizadas:
  //   entram pelas últimas 24 horas de TERMINOREAL.
  // ============================================================
  async getOccurrences(cr) {
    const sql = `
      SELECT
        tarefa.id,
        tarefa.status,
        tarefa.numero,
        tarefa.nome,

        tarefa.disponibilizacao
          AT TIME ZONE 'America/Sao_Paulo'
          AS disponibilizacao,

        tarefa.prazo
          AT TIME ZONE 'America/Sao_Paulo'
          AS prazo,

        tarefa.inicioreal
          AT TIME ZONE 'America/Sao_Paulo'
          AS inicioreal,

        tarefa.terminoreal
          AT TIME ZONE 'America/Sao_Paulo'
          AS terminoreal,

        TRIM(
          tarefa.estruturadescricao
        ) AS estruturadescricao,

        tarefa.expirada,

        recurso.nome AS vigilante,

        'https://apiprod.gpsvista.com.br/api/relatorio/tarefa?tarefaId='
          || tarefa.id::text AS pdf

      FROM dbo.tarefa

      LEFT JOIN dbo.recurso
        ON recurso.codigohash =
          tarefa.finalizadoporhash

      WHERE
        LEFT(tarefa.estruturanivel2, 5) = $1

        AND tarefa.nome = 'R-OCORRÊNCIA'

        AND tarefa.numero::text NOT IN (
          '225071901',
          '225833094'
        )

        AND (
          tarefa.status <> 85

          OR (
            tarefa.status = 85

            AND tarefa.terminoreal IS NOT NULL

            AND tarefa.terminoreal >=
              (
                NOW() AT TIME ZONE 'America/Sao_Paulo'
              ) - INTERVAL '24 hours'

            AND tarefa.terminoreal <=
              NOW() AT TIME ZONE 'America/Sao_Paulo'
          )
        )

      ORDER BY
        CASE
          WHEN tarefa.status = 85
            THEN tarefa.terminoreal
          ELSE tarefa.disponibilizacao
        END DESC;
    `;

    const { rows } =
      await corpPool.query(
        sql,
        [cr],
      );

    return rows;
  }

  // ============================================================
  // JUSTIFICATIVAS
  // ============================================================
  async getJustifications(cr) {
    const sql = `
      SELECT
        tarefa.id,
        tarefa.status,
        tarefa.numero,
        tarefa.nome,

        tarefa.disponibilizacao
          AT TIME ZONE 'America/Sao_Paulo'
          AS disponibilizacao,

        tarefa.prazo
          AT TIME ZONE 'America/Sao_Paulo'
          AS prazo,

        tarefa.inicioreal
          AT TIME ZONE 'America/Sao_Paulo'
          AS inicioreal,

        tarefa.terminoreal
          AT TIME ZONE 'America/Sao_Paulo'
          AS terminoreal,

        TRIM(
          tarefa.estruturadescricao
        ) AS estruturadescricao,

        tarefa.expirada,

        recurso.nome AS vigilante,

        'https://apiprod.gpsvista.com.br/api/relatorio/tarefa?tarefaId='
          || tarefa.id::text AS pdf

      FROM dbo.tarefa

      LEFT JOIN dbo.recurso
        ON recurso.codigohash =
          tarefa.finalizadoporhash

      WHERE
        LEFT(tarefa.estruturanivel2, 5) = $1

        AND tarefa.nome = 'R-JUSTIFICATIVA'

        AND tarefa.numero::text NOT IN (
          '225071901',
          '225833094'
        )

        AND (
          tarefa.status <> 85

          OR (
            tarefa.status = 85

            AND tarefa.terminoreal IS NOT NULL

            AND tarefa.terminoreal >=
              (
                NOW() AT TIME ZONE 'America/Sao_Paulo'
              ) - INTERVAL '24 hours'

            AND tarefa.terminoreal <=
              NOW() AT TIME ZONE 'America/Sao_Paulo'
          )
        )

      ORDER BY
        CASE
          WHEN tarefa.status = 85
            THEN tarefa.terminoreal
          ELSE tarefa.disponibilizacao
        END DESC;
    `;

    const { rows } =
      await corpPool.query(
        sql,
        [cr],
      );

    return rows;
  }
}

export default new EmaeRepository();
