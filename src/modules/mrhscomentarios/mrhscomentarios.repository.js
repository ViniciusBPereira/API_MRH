import pool from "../../config/db.js";

/**
 * Repository responsável pela persistência e consulta
 * de comentários vinculados às MRHs.
 *
 * Responsabilidades:
 * - Inserir comentários
 * - Listar comentários de uma MRH
 * - Isolar completamente a camada de dados
 */
class MrhsComentariosRepository {
  /**
   * Insere um novo comentário para uma MRH
   *
   * @param {Object} params
   * @param {number} params.mrhId - ID da MRH (ad_id)
   * @param {string} params.comentario - Texto do comentário
   * @param {string} params.usuarioId - UUID do usuário logado
   *
   * @returns {Promise<Object>} Comentário inserido (id + created_at)
   */
  async create({ mrhId, comentario, usuarioId }) {
    const query = `
      INSERT INTO mrhs_comentarios (
        mrh_id,
        usuario_id,
        comentario
      )
      VALUES ($1, $2, $3)
      RETURNING id, created_at;
    `;

    console.log("🟩 [REPOSITORY] INSERT mrhs_comentarios - INÍCIO", {
      mrhId,
      usuarioId,
      comentario,
      comentarioLength: comentario?.length,
    });

    try {
      const { rows } = await pool.query(query, [mrhId, usuarioId, comentario]);

      console.log("🟩 [REPOSITORY] INSERT OK", rows[0]);

      return rows[0];
    } catch (error) {
      console.log("🟥 [REPOSITORY ERROR] INSERT mrhs_comentarios", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
      });

      throw new Error("Erro ao inserir comentário da MRH.");
    }
  }

  /**
   * Lista todos os comentários de uma MRH
   *
   * @param {number} mrhId - ID da MRH (ad_id)
   *
   * @returns {Promise<Array>} Lista de comentários
   */
  async getByMrh(mrhId) {
    const query = `
      SELECT
        c.id,
        c.mrh_id,
        c.usuario_id,
        c.comentario,
        c.created_at
      FROM mrhs_comentarios c
      WHERE c.mrh_id = $1
      ORDER BY c.created_at ASC;
    `;

    console.log("🟩 [REPOSITORY] SELECT mrhs_comentarios - INÍCIO", {
      mrhId,
    });

    try {
      const { rows } = await pool.query(query, [mrhId]);

      console.log("🟩 [REPOSITORY] SELECT OK", {
        total: rows.length,
      });

      return rows;
    } catch (error) {
      console.log("🟥 [REPOSITORY ERROR] SELECT mrhs_comentarios", {
        message: error.message,
        code: error.code,
        detail: error.detail,
      });

      throw new Error("Erro ao buscar comentários da MRH.");
    }
  }
}

export default new MrhsComentariosRepository();
