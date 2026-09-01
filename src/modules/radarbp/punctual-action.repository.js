import pool from "../../config/db.js";

class PunctualActionRepository {
  // ============================================================
  // LISTAR TODAS
  // ============================================================

  async findAll() {
    const sql = `
      SELECT *
      FROM punctual_actions
      ORDER BY action_date DESC NULLS LAST,
               created_at DESC;
    `;

    const { rows } = await pool.query(sql);

    return rows;
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async findById(id) {
    const sql = `
      SELECT *
      FROM punctual_actions
      WHERE id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0];
  }

  // ============================================================
  // BUSCAR POR CONTRATO
  // ============================================================

  async findByContract(contractId) {
    const sql = `
      SELECT *
      FROM punctual_actions
      WHERE contract_id = $1
      ORDER BY action_date DESC NULLS LAST,
               created_at DESC;
    `;

    const { rows } = await pool.query(sql, [contractId]);

    return rows;
  }

  // ============================================================
  // CRIAR
  // ============================================================

  async create(data) {
    const sql = `
      INSERT INTO punctual_actions (
        contract_id,
        action_date,
        action_description,
        schedule,
        visit_data,
        completion_date,
        status,
        files
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING *;
    `;

    const values = [
      data.contract_id,
      data.action_date,
      data.action_description,
      data.schedule,
      data.visit_data,
      data.completion_date,
      data.status ?? "A fazer",
      JSON.stringify(data.files || []),
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  // ============================================================
  // ATUALIZAR
  // ============================================================

  async update(id, data) {
    const current = await this.findById(id);

    if (!current) {
      return null;
    }

    const sql = `
      UPDATE punctual_actions
      SET
        contract_id = $1,
        action_date = $2,
        action_description = $3,
        schedule = $4,
        visit_data = $5,
        completion_date = $6,
        status = $7,
        files = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *;
    `;

    const values = [
      data.contract_id,
      data.action_date,
      data.action_description,
      data.schedule,
      data.visit_data,
      data.completion_date,
      data.status ?? current.status ?? "A fazer",
      JSON.stringify(
        data.files !== undefined ? data.files : current.files || [],
      ),
      id,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  // ============================================================
  // DELETAR
  // ============================================================

  async delete(id) {
    await pool.query(
      `
      DELETE FROM punctual_actions
      WHERE id = $1
      `,
      [id],
    );

    return true;
  }

  // ============================================================
  // ARQUIVOS
  // ============================================================

  async getFiles(actionId) {
    const { rows } = await pool.query(
      `
      SELECT files
      FROM punctual_actions
      WHERE id = $1
      `,
      [actionId],
    );

    if (!rows.length) {
      return [];
    }

    return rows[0].files || [];
  }

  // ============================================================
  // BUSCAR ARQUIVO
  // ============================================================

  async getFile(actionId, fileId) {
    const files = await this.getFiles(actionId);

    return files.find((file) => file.id === fileId) || null;
  }

  // ============================================================
  // ADICIONAR ARQUIVO
  // ============================================================

  async addFile(actionId, file) {
    const sql = `
      UPDATE punctual_actions
      SET
        files = COALESCE(files, '[]'::jsonb) || $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
    `;

    const { rows } = await pool.query(sql, [JSON.stringify([file]), actionId]);

    return rows[0]?.files || [];
  }

  // ============================================================
  // REMOVER ARQUIVO
  // ============================================================

  async removeFile(actionId, fileId) {
    const files = await this.getFiles(actionId);

    const updatedFiles = files.filter((file) => file.id !== fileId);

    const { rows } = await pool.query(
      `
      UPDATE punctual_actions
      SET
        files = $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
      `,
      [JSON.stringify(updatedFiles), actionId],
    );

    return rows[0]?.files || [];
  }

  // ============================================================
  // SUBSTITUIR TODOS OS ARQUIVOS
  // ============================================================

  async replaceFiles(actionId, files) {
    const { rows } = await pool.query(
      `
      UPDATE punctual_actions
      SET
        files = $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
      `,
      [JSON.stringify(files || []), actionId],
    );

    return rows[0]?.files || [];
  }
}

export default new PunctualActionRepository();
