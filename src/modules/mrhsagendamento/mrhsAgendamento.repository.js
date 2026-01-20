import pool from "../../config/db.js";

/**
 * Repository responsável pelo acesso a dados
 * do módulo de MRHs — Agendamento.
 *
 * 🔒 Camada de infraestrutura (DB)
 */
class MrhsAgendamentoRepository {
  /* =====================================================
     📄 LISTAR MRHs — AGENDAMENTO
     ✔ inclui EXAME
     ✔ mantém filtros atuais
     ✔ filtra apenas etapa = 1
  ===================================================== */
  async getAll() {
    const method = "MrhsAgendamentoRepository.getAll";

    const query = `
      SELECT 
        data_registro,
        data_finalizacao_rh,
        ad_id AS mrh,
        ad_filial,
        desccr,
        nome_user_abertura,
        nome_responsavel,
        ctt_xndire,
        ctt_xngerr,
        ctt_xngere,
        ctt_xnsupe,
        escala,
        municipiocr,
        bairrocr,
        cepcr,
        descfuncao,
        horaentrada,
        horasaida,
        status_rh,
        status_dp,
        motivo_admissao,
        nome_colaborador,
        cpf_colaborador,

        -- campos já existentes
        exame,

        -- novos campos da etapa de agendamento
        uniformes,
        data_integracao,
        data_admissao_2 as data_admissao

      FROM public.mrhs
      WHERE status_rh LIKE '%ENCERRADO%'
        AND encerrado = FALSE
        AND etapa = 1;
    `;

    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error(`[REPOSITORY] ${method} - Erro`, error);
      throw new Error("Erro ao buscar MRHs do time de agendamento.");
    }
  }

  /* =====================================================
     ✏️ ATUALIZAR EXAME PELO MRH
     (mantido para consistência / reuso)
  ===================================================== */
  async atualizarExamePorMrh({ mrh, exame }) {
    const method = "MrhsAgendamentoRepository.atualizarExamePorMrh";

    const query = `
      UPDATE public.mrhs
      SET exame = $2
      WHERE ad_id = $1
      RETURNING exame;
    `;

    try {
      const { rows } = await pool.query(query, [mrh, exame]);
      if (rows.length === 0) return null;
      return rows[0].exame;
    } catch (error) {
      console.error(`[REPOSITORY] ${method} - Erro`, error);
      throw new Error("Erro ao atualizar exame.");
    }
  }

  /* =====================================================
     ✏️ ATUALIZAR CAMPOS DE AGENDAMENTO
     ✔ usado no auto-save (onBlur)
  ===================================================== */
  async atualizarAgendamentoPorMrh({
    mrh,
    uniformes,
    data_integracao,
    data_admissao,
  }) {
    const method = "MrhsAgendamentoRepository.atualizarAgendamentoPorMrh";

    const query = `
      UPDATE public.mrhs
      SET
        uniformes = $2,
        data_integracao = $3,
        data_admissao_2 = $4
      WHERE ad_id = $1
      RETURNING
        uniformes,
        data_integracao,
        data_admissao_2 as data_admissao;
    `;

    try {
      const { rows } = await pool.query(query, [
        mrh,
        uniformes,
        data_integracao,
        data_admissao,
      ]);

      if (rows.length === 0) return null;
      return rows[0];
    } catch (error) {
      console.error(`[REPOSITORY] ${method} - Erro`, error);
      throw new Error("Erro ao atualizar dados de agendamento.");
    }
  }
}

export default new MrhsAgendamentoRepository();
