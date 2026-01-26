// api/modules/candidatosregistrados/candidatosregistrados.repository.js

import pool from "../../config/db.js";

const candidatosRegistradosRepository = {
  async listarTodos() {
    const sql = `
      SELECT
        id,
        mrh_id,          -- ✅ MRH do candidato
        nome,
        cpf,
        telefone,
        email,
        endereco,
        status,
        desistente,      -- ✅ flag desistente
        docs
      FROM candidatos
      ORDER BY id DESC
    `;

    const result = await pool.query(sql);

    return result.rows.map((r) => ({
      ...r,
      desistente: r.desistente ?? false, // segurança
      docs: safeJson(r.docs),
    }));
  },

  async atualizarDesistente(id, desistente) {
    const sql = `
      UPDATE candidatos
      SET desistente = $2
      WHERE id = $1
      RETURNING id, desistente
    `;

    const result = await pool.query(sql, [id, desistente]);
    return result.rows[0] ?? null;
  },

  async excluir(id) {
    const sql = `DELETE FROM candidatos WHERE id = $1 RETURNING id`;
    const result = await pool.query(sql, [id]);
    return result.rows[0] ?? null;
  },
};

// --------------------------------------------------
// 🔧 safeJson: converte texto → JSON SEM ERROS
// --------------------------------------------------
function safeJson(value) {
  if (!value) return [];

  try {
    if (typeof value === "object") return value;
    if (typeof value === "string" && value.trim() === "") return [];
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export default candidatosRegistradosRepository;
