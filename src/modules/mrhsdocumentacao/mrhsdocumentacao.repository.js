import pool from "../../config/db.js";

/**
 * Repository responsável pelo acesso a dados
 * do módulo de MRHs — Time de Documentação.
 *
 * 🔒 Camada de infraestrutura (DB)
 */
class MrhsDocumentacaoRepository {
  /* =====================================================
     📄 LISTAR MRHs — TIME DE DOCUMENTAÇÃO
     ✔ inclui EXAME
     ✔ inclui CONDICAO
     ✔ filtra apenas etapa = 0
  ===================================================== */
  async getAll() {
    const method = "MrhsDocumentacaoRepository.getAll";

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
        exame,
        condicao
      FROM public.mrhs
      WHERE time = 'DOCUMENTACAO'
        AND etapa = 0;
    `;

    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error(`[REPOSITORY] ${method} - Erro`, error);
      throw new Error("Erro ao buscar MRHs do time de documentação.");
    }
  }

  /* =====================================================
     ✏️ ATUALIZAR EXAME PELO MRH
  ===================================================== */
  async atualizarExamePorMrh({ mrh, exame }) {
    const query = `
      UPDATE public.mrhs
      SET exame = $2
      WHERE ad_id = $1
      RETURNING exame;
    `;

    const { rows } = await pool.query(query, [mrh, exame]);
    if (rows.length === 0) return null;
    return rows[0].exame;
  }

  /* =====================================================
     🔁 ATUALIZAR CONDIÇÃO (PENDENTE / CONCLUIDO)
  ===================================================== */
  async atualizarCondicaoPorMrh({ mrh, condicao }) {
    const query = `
      UPDATE public.mrhs
      SET condicao = $2
      WHERE ad_id = $1
      RETURNING condicao;
    `;

    const { rows } = await pool.query(query, [mrh, condicao]);
    if (rows.length === 0) return null;
    return rows[0].condicao;
  }

  /* =====================================================
     📥 IMPORTAÇÃO EM MASSA (CSV)
     ✔ recebe MRH + data_exame
     ✔ seta condicao = CONCLUIDO
     ✔ usa transação
  ===================================================== */
  async importarExamesEmMassa(lista) {
    const client = await pool.connect();

    const resultado = {
      atualizados: [],
      nao_encontrados: [],
    };

    const query = `
      UPDATE public.mrhs
      SET 
        exame = $2,
        condicao = 'CONCLUIDO'
      WHERE ad_id = $1
      RETURNING ad_id;
    `;

    try {
      await client.query("BEGIN");

      for (const item of lista) {
        const { mrh, data_exame } = item;

        const { rows } = await client.query(query, [mrh, data_exame]);

        if (rows.length === 0) {
          resultado.nao_encontrados.push(mrh);
        } else {
          resultado.atualizados.push(mrh);
        }
      }

      await client.query("COMMIT");
      return resultado;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("[REPOSITORY] importarExamesEmMassa - Erro", error);
      throw new Error("Erro na importação em massa de exames.");
    } finally {
      client.release();
    }
  }

  /* =====================================================
     ✅ CONCLUIR ETAPA (etapa = 1)
  ===================================================== */
  async concluirEtapaPorMrh(mrh) {
    const query = `
      UPDATE public.mrhs
      SET etapa = 1
      WHERE ad_id = $1
      RETURNING etapa;
    `;

    const { rows } = await pool.query(query, [mrh]);
    if (rows.length === 0) return null;
    return rows[0].etapa;
  }

  /* =====================================================
     (RESTANTE — INALTERADO)
  ===================================================== */

  async getItensDocumentosPorCpf(cpf) {
    const query = `
      SELECT
        c.id              AS candidato_id,
        idoc.id           AS item_id,
        idoc.nome         AS nome_documento,
        idoc.concluido,
        idoc.ordem,
        idoc.data_criacao,
        idoc.atualizado_em
      FROM candidatos c
      LEFT JOIN itens_documentos idoc
        ON idoc.id_candidato = c.id
      WHERE c.cpf = $1
      ORDER BY idoc.ordem ASC NULLS LAST;
    `;

    const { rows } = await pool.query(query, [cpf]);
    return rows;
  }

  async criarItemDocumentoPorCpf({ cpf, nome, ordem = null }) {
    const queryBuscarCandidato = `
      SELECT id FROM candidatos WHERE cpf = $1 LIMIT 1;
    `;

    const queryInserir = `
      INSERT INTO itens_documentos (
        id_candidato,
        nome,
        ordem,
        concluido,
        data_criacao
      )
      VALUES ($1, $2, $3, FALSE, NOW())
      RETURNING *;
    `;

    const { rows: candidatos } = await pool.query(queryBuscarCandidato, [cpf]);
    if (candidatos.length === 0) return null;

    const { rows } = await pool.query(queryInserir, [
      candidatos[0].id,
      nome,
      ordem,
    ]);

    return rows[0];
  }

  async listarUploadsPorCpf(cpf) {
    const query = `
      SELECT docs
      FROM candidatos
      WHERE cpf = $1
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [cpf]);
    if (rows.length === 0 || !Array.isArray(rows[0].docs)) return [];
    return rows[0].docs;
  }

  async registrarUploadDocumentoPorCpf({ cpf, novoDocumento }) {
    const queryBuscar = `
      SELECT docs
      FROM candidatos
      WHERE cpf = $1
      LIMIT 1;
    `;

    const queryUpdate = `
      UPDATE candidatos
      SET docs = $2::jsonb
      WHERE cpf = $1;
    `;

    const { rows } = await pool.query(queryBuscar, [cpf]);
    if (rows.length === 0) return null;

    const docsAtuais = Array.isArray(rows[0].docs) ? rows[0].docs : [];
    const docsAtualizados = [...docsAtuais, novoDocumento];

    await pool.query(queryUpdate, [cpf, JSON.stringify(docsAtualizados)]);
    return novoDocumento;
  }
}

export default new MrhsDocumentacaoRepository();
