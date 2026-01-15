import pool from "../../config/db.js";

/**
 * Repository responsável pela persistência e consulta
 * de comentários vinculados às MRHs.
 *
 * Responsabilidades:
 * - Inserir comentários
 * - Listar comentários de uma MRH
 * - Isolar completamente a camada de dados
 *
 * Observações:
 * - Nenhum log direto (logs ficam no service/controller)
 * - Erros são encapsulados para não vazar detalhes do banco
 */
class MrhsComentariosRepository {
  /**
   * Insere um novo comentário para uma MRH
   *
   * @param {Object} params
   * @param {number} params.mrhId - ID da MRH
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

    try {
      const { rows } = await pool.query(query, [mrhId, usuarioId, comentario]);

      return rows[0];
    } catch (error) {
      throw new Error("Erro ao inserir comentário da MRH.");
    }
  }

  /**
   * Lista todos os comentários de uma MRH
   *
   * @param {number} mrhId - ID da MRH
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

    try {
      const { rows } = await pool.query(query, [mrhId]);
      return rows;
    } catch (error) {
      throw new Error("Erro ao buscar comentários da MRH.");
    }
  }
}

export default new MrhsComentariosRepository();
