// api/modules/candidatosregistrados/candidatosregistrados.repository.js

import pool from "../../config/db.js";

const candidatosRegistradosRepository = {
  async listarTodos() {
    const sql = `
      SELECT
        id,
        nome,
        cpf,
        telefone,
        email,
        endereco,
        status,
        docs
      FROM candidatos
      ORDER BY id DESC
    `;

    const result = await pool.query(sql);

    // 🔥 Garantir que docs sempre será um array válido
    const rows = result.rows.map((r) => ({
      ...r,
      docs: safeJson(r.docs),
    }));

    return rows;
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
  // Se veio null, undefined ou vazio → []
  if (!value) return [];

  try {
    // Se já veio array/objeto do banco, retorna diretamente
    if (typeof value === "object") return value;

    // Se veio como string vazia → []
    if (typeof value === "string" && value.trim() === "") return [];

    // Tenta fazer parse da string
    return JSON.parse(value);
  } catch {
    // Se quebrar, nunca jogamos erro → retornamos []
    return [];
  }
}

export default candidatosRegistradosRepository;
