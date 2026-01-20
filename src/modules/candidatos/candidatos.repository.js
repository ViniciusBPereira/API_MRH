// src/modules/candidatos/candidatos.repository.js
import pool from "../../config/db.js";

class CandidatosRepository {
  /* -----------------------------------------------------
   * LISTAR CANDIDATOS POR MRH
   * ----------------------------------------------------- */
  async getByMRH(mrh_id) {
    const query = `
      SELECT 
        id,
        mrh_id,
        nome,
        cpf,
        telefone,
        email,
        endereco,
        status,
        pre_selecao,
        ex_colaborador,
        brick,
        vt,
        observacoes,
        docs,
        ficha_id,

        -- 🔥 TODAS AS VALIDAÇÕES INDIVIDUAIS
        validacaoAPT,
        validacaoCARD,
        validacaoOcorrencias,
        validacaoBrickPF,
        validacaoBrickMandado,
        validacaoBrickProcessos,
        validacaoEndereco,
        validacaoSegundaEtapa,
        validacaoDocumentos,
        validacaoCurriculoGPSvc,
        validacaoReservista,

        criado_em,
        atualizado_em
      FROM candidatos
      WHERE mrh_id = $1
      ORDER BY criado_em ASC;
    `;

    const result = await pool.query(query, [mrh_id]);
    return result.rows;
  }

  /* -----------------------------------------------------
   * BUSCAR POR ID
   * ----------------------------------------------------- */
  async getById(id) {
    const query = `
      SELECT 
        id,
        mrh_id,
        nome,
        cpf,
        telefone,
        email,
        endereco,
        status,
        pre_selecao,
        ex_colaborador,
        brick,
        vt,
        observacoes,
        docs,
        ficha_id,

        -- 🔥 TODAS AS VALIDAÇÕES
        validacaoAPT,
        validacaoCARD,
        validacaoOcorrencias,
        validacaoBrickPF,
        validacaoBrickMandado,
        validacaoBrickProcessos,
        validacaoEndereco,
        validacaoSegundaEtapa,
        validacaoDocumentos,
        validacaoCurriculoGPSvc,
        validacaoReservista,

        criado_em,
        atualizado_em
      FROM candidatos
      WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /* -----------------------------------------------------
   * LISTAR DOCUMENTOS DO CANDIDATO
   * ----------------------------------------------------- */
  async getDocuments(id) {
    const result = await pool.query(
      `SELECT docs FROM candidatos WHERE id = $1`,
      [id]
    );

    let docs = result.rows[0]?.docs || [];

    if (typeof docs === "string") {
      try {
        docs = JSON.parse(docs);
      } catch {
        docs = [];
      }
    }
    if (!Array.isArray(docs)) docs = [];

    return docs;
  }

  /* -----------------------------------------------------
   * CRIAR CANDIDATO
   * ----------------------------------------------------- */
  async create(mrh_id, data) {
    const query = `
      INSERT INTO candidatos (
        mrh_id, nome, cpf, telefone, email, endereco,
        status, pre_selecao, ex_colaborador, brick, vt,
        observacoes, docs, ficha_id,

        -- 🔥 VALIDAÇÕES (inicial = pendente)
        validacaoAPT,
        validacaoCARD,
        validacaoOcorrencias,
        validacaoBrickPF,
        validacaoBrickMandado,
        validacaoBrickProcessos,
        validacaoEndereco,
        validacaoSegundaEtapa,
        validacaoDocumentos,
        validacaoCurriculoGPSvc,
        validacaoReservista
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,
        $12,$13,NULL,

        'pendente','pendente','pendente','pendente','pendente',
        'pendente','pendente','pendente','pendente','pendente',
        'pendente'
      )
      RETURNING *;
    `;

    const values = [
      mrh_id,
      data.nome,
      data.cpf,
      data.telefone,
      data.email,
      data.endereco,
      data.status || "",
      data.pre_selecao || "",
      data.ex_colaborador || false,
      data.brick || false,
      data.vt || 0,
      data.observacoes || "",
      JSON.stringify(data.docs || []),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /* -----------------------------------------------------
   * ATUALIZAR CANDIDATO COMPLETO
   * ----------------------------------------------------- */
  async update(id, data) {
    const query = `
      UPDATE candidatos
      SET 
        nome = $1,
        cpf = $2,
        telefone = $3,
        email = $4,
        endereco = $5,
        status = $6,
        pre_selecao = $7,
        ex_colaborador = $8,
        brick = $9,
        vt = $10,
        observacoes = $11,
        docs = $12,

        validacaoAPT = $13,
        validacaoCARD = $14,
        validacaoOcorrencias = $15,
        validacaoBrickPF = $16,
        validacaoBrickMandado = $17,
        validacaoBrickProcessos = $18,
        validacaoEndereco = $19,
        validacaoSegundaEtapa = $20,
        validacaoDocumentos = $21,
        validacaoCurriculoGPSvc = $22,
        validacaoReservista = $23,

        atualizado_em = NOW()
      WHERE id = $24
      RETURNING *;
    `;

    const values = [
      data.nome,
      data.cpf,
      data.telefone,
      data.email,
      data.endereco,
      data.status,
      data.pre_selecao,
      data.ex_colaborador,
      data.brick,
      data.vt,
      data.observacoes,
      JSON.stringify(data.docs || []),

      data.validacaoAPT,
      data.validacaoCARD,
      data.validacaoOcorrencias,
      data.validacaoBrickPF,
      data.validacaoBrickMandado,
      data.validacaoBrickProcessos,
      data.validacaoEndereco,
      data.validacaoSegundaEtapa,
      data.validacaoDocumentos,
      data.validacaoCurriculoGPSvc,
      data.validacaoReservista,

      id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /* -----------------------------------------------------
   * 🔥 ATUALIZAR UMA VALIDAÇÃO INDIVIDUAL
   * ----------------------------------------------------- */
  async updateValidacaoIndividual(id, campo, valor) {
    const query = `
      UPDATE candidatos
      SET ${campo} = $1,
          atualizado_em = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [valor, id]);
    return result.rows[0];
  }

  /* -----------------------------------------------------
   * ATUALIZAR STATUS
   * ----------------------------------------------------- */
  async updateStatus(id, status) {
    const query = `
      UPDATE candidatos
      SET status = $1,
          atualizado_em = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  /* -----------------------------------------------------
   * REMOVER CANDIDATO
   * ----------------------------------------------------- */
  async delete(id) {
    await pool.query(`DELETE FROM candidatos WHERE id = $1`, [id]);
  }

  /* -----------------------------------------------------
   * ATUALIZAR LISTA DE DOCUMENTOS
   * ----------------------------------------------------- */
  async updateDocs(id, docsArray) {
    const query = `
      UPDATE candidatos
      SET docs = $1::jsonb,
          atualizado_em = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [JSON.stringify(docsArray), id]);
    return result.rows[0];
  }

  /* -----------------------------------------------------
   * REMOVER DOCUMENTO INDIVIDUAL
   * ----------------------------------------------------- */
  async removeDocument(id, fileName) {
    const docs = await this.getDocuments(id);
    const updatedDocs = docs.filter((doc) => doc.nome !== fileName);
    return await this.updateDocs(id, updatedDocs);
  }

  /* -----------------------------------------------------
   * ATUALIZAR FICHA_ID
   * ----------------------------------------------------- */
  async updateFichaId(candidatoId, fichaId) {
    const query = `
      UPDATE candidatos
      SET ficha_id = $1,
          atualizado_em = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [fichaId, candidatoId]);
    return result.rows[0];
  }
}

export default new CandidatosRepository();
