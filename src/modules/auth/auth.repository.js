import pool from "../../config/db.js";

class AuthRepository {
  // Buscar usuário pelo e-mail
  async findByEmail(email) {
    const query = `
      SELECT id, nome, email, senha_hash, ultimo_login, ativo
      FROM usuarios
      WHERE email = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Criar usuário (caso precise depois)
  async createUser({ nome, email, senhaHash }) {
    const query = `
      INSERT INTO usuarios (nome, email, senha_hash)
      VALUES ($1, $2, $3)
      RETURNING id, nome, email, ultimo_login, ativo;
    `;

    const values = [nome, email, senhaHash];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Atualizar último login do usuário
  async updateLastLogin(userId) {
    const query = `
      UPDATE usuarios
      SET ultimo_login = NOW()
      WHERE id = $1;
    `;

    await pool.query(query, [userId]);
  }
}

export default new AuthRepository();
