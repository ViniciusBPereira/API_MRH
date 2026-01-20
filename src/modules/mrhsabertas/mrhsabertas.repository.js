import pool from "../../config/db.js";

/**
 * Repository responsável por consultas de MRHs abertas.
 *
 * Responsabilidades:
 * - Buscar MRHs não encerradas
 * - Retornar total de candidatos por MRH
 * - Retornar total de comentários por MRH
 *
 * Observações:
 * - Usa subqueries agregadas para evitar contagem duplicada
 * - Preparado para produção (sem logs diretos no repository)
 */
class MrhsAbertasRepository {
  /**
   * Retorna todas as MRHs abertas com contagem de candidatos e comentários.
   *
   * @returns {Promise<Array>} Lista de MRHs abertas
   * @throws {Error} Erro tratado para a camada superior
   */
  async getAll() {
    const query = `
      SELECT 
        m.data_registro,
        m.ad_id AS mrh,
        m.ad_filial,
        m.desccr,
        m.nome_user_abertura,
        m.nome_responsavel,
        m.ctt_xndire,
        m.ctt_xngerr,
        m.ctt_xngere,
        m.ctt_xnsupe,
        m.escala,
        m.municipiocr,
        m.bairrocr,
        m.cepcr,
        m.descfuncao,
        m.horaentrada,
        m.horasaida,
        m.status_rh,
        m.status_dp,
        m.motivo_admissao,
        m.ad_salario

        -- Total de candidatos vinculados à MRH
        COALESCE(c.total_candidatos, 0) AS total_candidatos,

        -- Total de comentários vinculados à MRH
        COALESCE(mc.total_comentarios, 0) AS total_comentarios

      FROM public.mrhs m

      -- Subquery para contagem de candidatos
      LEFT JOIN (
        SELECT
          mrh_id,
          COUNT(*) AS total_candidatos
        FROM candidatos
        GROUP BY mrh_id
      ) c ON c.mrh_id = m.ad_id

      -- Subquery para contagem de comentários
      LEFT JOIN (
        SELECT
          mrh_id,
          COUNT(*) AS total_comentarios
        FROM mrhs_comentarios
        GROUP BY mrh_id
      ) mc ON mc.mrh_id = m.ad_id

      WHERE m.status_rh NOT LIKE '%ENCERRADO%'
        AND m.encerrado = FALSE;
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      // O erro é encapsulado para não vazar detalhes de infraestrutura
      throw new Error("Erro ao buscar MRHs abertas.");
    }
  }
}

export default new MrhsAbertasRepository();
