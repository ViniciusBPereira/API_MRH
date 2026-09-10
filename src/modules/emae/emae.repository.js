import corpPool from "../../config/corpDb.js";

class EmaeRepository {
  // ============================================================
  // PONTOS DE RONDA / GEOLOCALIZAÇÃO
  // ============================================================
  // Calcula uma coordenada fixa para cada ponto utilizando
  // a média das coordenadas históricas registradas no GPSVISTA.
  //
  // O DISTINCT reduz duplicidades idênticas vindas da execução.
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

      GROUP BY
        ponto

      ORDER BY
        ponto;
    `;

    const { rows } = await corpPool.query(
      sql,
      [cr],
    );

    return rows;
  }

  // ============================================================
  // JANELAS DE RONDA DISPONÍVEIS
  // ============================================================
  // Retorna somente rondas que já foram disponibilizadas.
  //
  // As janelas são obtidas diretamente do GPSVISTA, evitando
  // assumir que todas as rondas começam em horas cheias.
  // ============================================================
  async getRoundWindows(cr) {
    const sql = `
      SELECT DISTINCT
        tarefa.nome,
        tarefa.disponibilizacao,
        tarefa.prazo

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
        tarefa.disponibilizacao DESC;
    `;

    const { rows } = await corpPool.query(
      sql,
      [cr],
    );

    return rows;
  }

  // ============================================================
  // TAREFAS DE UMA JANELA ESPECÍFICA DE RONDA
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
        tarefa.disponibilizacao,
        tarefa.prazo,
        tarefa.terminoreal,

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

    const { rows } = await corpPool.query(
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
  // REGRA:
  //
  // 1. Se ainda NÃO foi finalizada:
  //    continua sendo retornada para acompanhamento.
  //
  // 2. Se foi finalizada (status 85):
  //    utilizamos TERMINOREAL para verificar se a ocorrência
  //    aconteceu nas últimas 24 horas.
  //
  // Isso é necessário porque a ocorrência pode ter sido criada
  // vários dias antes e somente finalizada agora.
  // ============================================================
  async getOccurrences(cr) {
    const sql = `
      SELECT
        tarefa.id,
        tarefa.status,
        tarefa.numero,
        tarefa.nome,
        tarefa.disponibilizacao,
        tarefa.prazo,
        tarefa.inicioreal,
        tarefa.terminoreal,

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

        AND tarefa.numero NOT IN (
  225071901,
  225833094
)

        AND (
          -- Tarefa ainda aberta
          tarefa.status <> 85

          OR

          -- Tarefa finalizada recentemente
          (
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

    const { rows } = await corpPool.query(
      sql,
      [cr],
    );

    return rows;
  }

  // ============================================================
  // JUSTIFICATIVAS
  // ============================================================
  //
  // Mesma regra das ocorrências:
  //
  // - aberta:
  //   permanece disponível para acompanhamento;
  //
  // - finalizada:
  //   entra no histórico considerando TERMINOREAL,
  //   e não a data de disponibilização.
  // ============================================================
  async getJustifications(cr) {
    const sql = `
      SELECT
        tarefa.id,
        tarefa.status,
        tarefa.numero,
        tarefa.nome,
        tarefa.disponibilizacao,
        tarefa.prazo,
        tarefa.inicioreal,
        tarefa.terminoreal,

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

        AND (
          -- Tarefa ainda aberta
          tarefa.status <> 85

          OR

          -- Tarefa finalizada recentemente
          (
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

    const { rows } = await corpPool.query(
      sql,
      [cr],
    );

    return rows;
  }
}

export default new EmaeRepository();