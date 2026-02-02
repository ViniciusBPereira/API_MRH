import pool from "../../../config/db.js";

class RondasCorpLoginRepository {
  /**
   * Buscar usuário SOMENTE pelo email
   * Usado no login
   */
  async findByEmail(email) {
    const query = `
      SELECT
        id,
        nome,
        email,
        senha_hash,
        cr,
        ativo,
        ultimo_login
      FROM corp_rondas_usuarios
      WHERE email = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Criar usuário da aplicação Rondas Corp
   * Usado no registro (CR definido aqui)
   */
  async createUser({ nome, email, senhaHash, cr }) {
    const query = `
      INSERT INTO corp_rondas_usuarios
        (nome, email, senha_hash, cr)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id,
        nome,
        email,
        cr,
        ativo,
        ultimo_login;
    `;

    const values = [nome, email, senhaHash, cr];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Atualizar último login
   */
  async updateLastLogin(userId) {
    const query = `
      UPDATE corp_rondas_usuarios
      SET ultimo_login = NOW()
      WHERE id = $1;
    `;

    await pool.query(query, [userId]);
  }

  /**
   * Verifica se já existe usuário com o email
   * Evita duplicidade no registro
   */
  async existsByEmail(email) {
    const query = `
      SELECT 1
      FROM corp_rondas_usuarios
      WHERE email = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [email]);
    return result.rowCount > 0;
  }
}

export default new RondasCorpLoginRepository();
