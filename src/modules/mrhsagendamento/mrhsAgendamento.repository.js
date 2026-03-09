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
     ✔ inclui observação
     ✔ inclui checkbox manter
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

        -- campos existentes
        exame,

        -- agendamento
        uniformes,
        data_integracao,
        data_admissao_2 AS data_admissao,

        -- novos campos
        observacao_agendamento,
        COALESCE(manter_agendamento, TRUE) AS manter_agendamento

      FROM public.mrhs
      WHERE encerrado = FALSE
        AND etapa = 2
        AND COALESCE(manter_agendamento, TRUE) = TRUE;
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
     ✔ usado no auto-save
  ===================================================== */
  async atualizarAgendamentoPorMrh({
    mrh,
    uniformes,
    data_integracao,
    data_admissao,
    observacao,
    manter
  }) {
    const method = "MrhsAgendamentoRepository.atualizarAgendamentoPorMrh";

    const query = `
      UPDATE public.mrhs
      SET
        uniformes = $2,
        data_integracao = $3,
        data_admissao_2 = $4,
        observacao_agendamento = $5,
        manter_agendamento = $6
      WHERE ad_id = $1
      RETURNING
        uniformes,
        data_integracao,
        data_admissao_2 AS data_admissao,
        observacao_agendamento,
        manter_agendamento;
    `;

    try {
      const { rows } = await pool.query(query, [
        mrh,
        uniformes,
        data_integracao,
        data_admissao,
        observacao,
        manter
      ]);

      if (rows.length === 0) return null;

      return rows[0];

    } catch (error) {
      console.error(`[REPOSITORY] ${method} - Erro`, error);
      throw new Error("Erro ao atualizar dados de agendamento.");
    }
  }


  /* =====================================================
     ✅ BOTÃO DO TOPO
     Concluir tudo que estiver marcado
     (manter_agendamento = TRUE)
  ===================================================== */
  async concluirAgendamentosMarcados() {

    const method = "MrhsAgendamentoRepository.concluirAgendamentosMarcados";

    const query = `
      UPDATE public.mrhs
      SET
        etapa = 2
      WHERE etapa = 1
        AND COALESCE(manter_agendamento, TRUE) = TRUE
      RETURNING ad_id;
    `;

    try {

      const { rows } = await pool.query(query);
      return rows;

    } catch (error) {

      console.error(`[REPOSITORY] ${method} - Erro`, error);
      throw new Error("Erro ao concluir agendamentos.");

    }
  }

}

export default new MrhsAgendamentoRepository();
