import pool from "../../config/db.js";

class CheckDocsRepository {
  // 🔹 Lista TODOS os itens (uso administrativo)
  async getAll() {
    const query = `
      SELECT
        id,
        id_candidato,
        nome,
        concluido,
        ordem,
        data_criacao,
        atualizado_em
      FROM itens_documentos
      ORDER BY id_candidato, ordem;
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // 🔹 Lista checklist por candidato
  async getByCandidato(idCandidato) {
    const query = `
      SELECT
        id,
        nome,
        concluido,
        ordem,
        data_criacao,
        atualizado_em
      FROM itens_documentos
      WHERE id_candidato = $1
      ORDER BY ordem;
    `;

    const result = await pool.query(query, [idCandidato]);
    return result.rows;
  }

  // 🔹 Busca item específico
  async getById(id) {
    const query = `
      SELECT
        id,
        id_candidato,
        nome,
        concluido,
        ordem,
        data_criacao,
        atualizado_em
      FROM itens_documentos
      WHERE id = $1 ORDER BY ordem;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // 🔹 Cria novo item da checklist
  async create({ id_candidato, nome, ordem }) {
    const query = `
      INSERT INTO itens_documentos
        (id_candidato, nome, concluido, ordem)
      VALUES
        ($1, $2, false, $3)
      RETURNING *;
    `;

    const result = await pool.query(query, [id_candidato, nome, ordem]);

    return result.rows[0];
  }

  // 🔹 Atualiza dados do item (nome / ordem)
  async update(id, { nome, ordem }) {
    const query = `
      UPDATE itens_documentos
      SET
        nome = COALESCE($2, nome),
        ordem = COALESCE($3, ordem),
        atualizado_em = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id, nome, ordem]);
    return result.rows[0];
  }

  // 🔹 Atualiza SOMENTE o check (checkbox)
  async updateCheck(id, concluido) {
    const query = `
      UPDATE itens_documentos
      SET
        concluido = $2,
        atualizado_em = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id, concluido]);
    return result.rows[0];
  }

  // 🔹 Deleta item
  async delete(id) {
    const query = `
      DELETE FROM itens_documentos
      WHERE id = $1
      RETURNING id;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default new CheckDocsRepository();
