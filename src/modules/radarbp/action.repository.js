import pool from "../../config/db.js";

class ActionRepository {
  // ============================================================
  // LISTAR TODAS AS AÇÕES
  // ============================================================

  async findAll() {
    const sql = `
      SELECT *
      FROM action_plans
      ORDER BY due_date;
    `;

    const { rows } = await pool.query(sql);

    return rows;
  }

  // ============================================================
  // BUSCAR AÇÃO POR ID
  // ============================================================

  async findById(id) {
    const sql = `
      SELECT *
      FROM action_plans
      WHERE id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0] || null;
  }

  // ============================================================
  // BUSCAR AÇÕES POR CONTRATO
  // ============================================================

  async findByContract(contractId) {
    const sql = `
      SELECT *
      FROM action_plans
      WHERE contract_id = $1
      ORDER BY due_date;
    `;

    const { rows } = await pool.query(sql, [contractId]);

    return rows;
  }

  // ============================================================
  // CRIAR AÇÃO
  // ============================================================

  async create(data) {
    const sql = `
      INSERT INTO action_plans (
        contract_id,
        description,
        execution_plan,
        responsible,
        due_date,
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
        $7
      )
      RETURNING *;
    `;

    const values = [
      data.contract_id,
      data.description,
      data.execution_plan ?? null,
      data.responsible ?? null,
      data.due_date ?? null,
      data.status ?? "A fazer",
      JSON.stringify(data.files || []),
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0] || null;
  }

  // ============================================================
  // ATUALIZAR AÇÃO
  // ============================================================

  async update(id, data) {
    const current = await this.findById(id);

    if (!current) {
      return null;
    }

    const sql = `
      UPDATE action_plans
      SET
        contract_id = $1,
        description = $2,
        execution_plan = $3,
        responsible = $4,
        due_date = $5,
        status = $6,
        files = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *;
    `;

    const values = [
      data.contract_id ?? current.contract_id,
      data.description ?? current.description,
      data.execution_plan ?? null,
      data.responsible ?? null,
      data.due_date ?? null,
      data.status ?? current.status,
      JSON.stringify(data.files ?? current.files ?? []),
      id,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0] || null;
  }

  // ============================================================
  // EXCLUIR AÇÃO
  // ============================================================

  async delete(id) {
    await pool.query(
      `
      DELETE FROM action_plans
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
      FROM action_plans
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
      UPDATE action_plans
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
      UPDATE action_plans
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
  // SUBSTITUIR ARQUIVOS
  // ============================================================

  async replaceFiles(actionId, files) {
    const { rows } = await pool.query(
      `
      UPDATE action_plans
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

export default new ActionRepository();
