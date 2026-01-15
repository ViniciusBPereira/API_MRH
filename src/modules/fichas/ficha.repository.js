// src/modules/fichas/ficha.repository.js
import pool from "../../config/db.js";

/** Normaliza qualquer tipo recebido para um JSONB com formato { itens: [] } */
function ensureObjItens(value) {
  if (!value) return { itens: [] };

  // Se já está no formato correto
  if (typeof value === "object" && Array.isArray(value.itens)) {
    return { itens: value.itens };
  }

  // Se vier array direto, converte
  if (Array.isArray(value)) {
    return { itens: value };
  }

  // Se vier objeto que parece um único item
  if (typeof value === "object") {
    return { itens: [value] };
  }

  // Caso contrário, fallback seguro
  return { itens: [] };
}

/** Normaliza jsonb simples que contém { texto: "" } */
function ensureTextoObject(value) {
  if (!value) return { texto: "" };
  if (typeof value === "string") return { texto: value };
  if (typeof value === "object" && value.texto !== undefined) return value;
  return { texto: "" };
}

class FichaRepository {
  async create(candidatoId, data = {}) {
    const query = `
      INSERT INTO candidato_ficha (
        candidato_id,
        data_registro,
        parecer_selecao,
        aprovado_para_vaga,
        cr,
        cliente,
        data_cadastro,
        encaminhamento_exame,
        cargo_pretendido,
        salario_pretendido,
        sexo,
        idade,
        estado_civil,
        data_nascimento,
        cidade_nascimento,
        estado_nascimento,
        rg,
        rg_estado,
        rg_data,
        pis,
        carteira_profissional,
        reservista,
        titulo_eleitor,
        cnh,
        nome_pai,
        nome_mae,
        telefone_residencial,
        telefone_recados,
        ponto_referencia,
        dependentes,
        formacao,
        cursos,
        disponibilidade,
        informacoes_adicionais,
        experiencias,
        como_conheceu
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36
      )
      RETURNING *;
    `;

    const values = [
      candidatoId,
      data?.data_registro || null,
      data?.parecer_selecao || null,
      typeof data?.aprovado_para_vaga === "boolean"
        ? data.aprovado_para_vaga
        : null,
      data?.cr || null,
      data?.cliente || null,
      data?.data_cadastro || null,
      data?.encaminhamento_exame || null,
      data?.cargo_pretendido || null,
      data?.salario_pretendido ?? null,
      data?.sexo || null,
      data?.idade ?? null,
      data?.estado_civil || null,
      data?.data_nascimento || null,
      data?.cidade_nascimento || null,
      data?.estado_nascimento || null,
      data?.rg || null,
      data?.rg_estado || null,
      data?.rg_data || null,
      data?.pis || null,

      data?.carteira_profissional || {}, // jsonb comum
      data?.reservista || null,
      data?.titulo_eleitor || {}, // jsonb comum
      data?.cnh || {}, // jsonb comum

      data?.nome_pai || null,
      data?.nome_mae || null,
      data?.telefone_residencial || null,
      data?.telefone_recados || null,
      data?.ponto_referencia || null,

      data?.dependentes || [], // array simples

      ensureObjItens(data?.formacao), // << NOVO
      ensureObjItens(data?.cursos), // << NOVO
      ensureTextoObject(data?.disponibilidade), // { texto: "" }
      ensureTextoObject(data?.informacoes_adicionais), // { texto: "" }
      ensureObjItens(data?.experiencias), // << NOVO
      ensureTextoObject(data?.como_conheceu), // { texto: "" }
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(id, data = {}) {
    const query = `
      UPDATE candidato_ficha SET
        data_registro = $1,
        parecer_selecao = $2,
        aprovado_para_vaga = $3,
        cr = $4,
        cliente = $5,
        data_cadastro = $6,
        encaminhamento_exame = $7,
        cargo_pretendido = $8,
        salario_pretendido = $9,
        sexo = $10,
        idade = $11,
        estado_civil = $12,
        data_nascimento = $13,
        cidade_nascimento = $14,
        estado_nascimento = $15,
        rg = $16,
        rg_estado = $17,
        rg_data = $18,
        pis = $19,
        carteira_profissional = $20,
        reservista = $21,
        titulo_eleitor = $22,
        cnh = $23,
        nome_pai = $24,
        nome_mae = $25,
        telefone_residencial = $26,
        telefone_recados = $27,
        ponto_referencia = $28,
        dependentes = $29,
        formacao = $30,
        cursos = $31,
        disponibilidade = $32,
        informacoes_adicionais = $33,
        experiencias = $34,
        como_conheceu = $35,
        atualizado_em = NOW()
      WHERE id = $36
      RETURNING *;
    `;

    const values = [
      data?.data_registro || null,
      data?.parecer_selecao || null,
      typeof data?.aprovado_para_vaga === "boolean"
        ? data.aprovado_para_vaga
        : null,
      data?.cr || null,
      data?.cliente || null,
      data?.data_cadastro || null,
      data?.encaminhamento_exame || null,
      data?.cargo_pretendido || null,
      data?.salario_pretendido ?? null,
      data?.sexo || null,
      data?.idade ?? null,
      data?.estado_civil || null,
      data?.data_nascimento || null,
      data?.cidade_nascimento || null,
      data?.estado_nascimento || null,
      data?.rg || null,
      data?.rg_estado || null,
      data?.rg_data || null,
      data?.pis || null,

      data?.carteira_profissional || {},
      data?.reservista || null,
      data?.titulo_eleitor || {},
      data?.cnh || {},

      data?.nome_pai || null,
      data?.nome_mae || null,
      data?.telefone_residencial || null,
      data?.telefone_recados || null,
      data?.ponto_referencia || null,

      data?.dependentes || [],

      ensureObjItens(data?.formacao), // << NOVO
      ensureObjItens(data?.cursos), // << NOVO
      ensureTextoObject(data?.disponibilidade), // << NOVO
      ensureTextoObject(data?.informacoes_adicionais), // << NOVO
      ensureObjItens(data?.experiencias), // << NOVO
      ensureTextoObject(data?.como_conheceu), // << NOVO

      id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM candidato_ficha WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }
}

export default new FichaRepository();
