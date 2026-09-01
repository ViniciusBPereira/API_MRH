import pool from "../../config/db.js";

class ActionRepository {
  // ============================================================
  // LISTAR TODOS OS PLANOS DE AÇÃO
  // ============================================================

  async findAll() {
    const sql = `
      SELECT
        id,
        contract_id,
        description,
        execution_plan,
        indicators,
        responsible,
        due_date,
        status,
        files,
        created_at,
        updated_at
      FROM action_plans
      ORDER BY due_date ASC NULLS LAST, created_at DESC;
    `;

    const { rows } = await pool.query(sql);

    return rows;
  }

  // ============================================================
  // BUSCAR PLANO DE AÇÃO POR ID
  // ============================================================

  async findById(id) {
    const sql = `
      SELECT
        id,
        contract_id,
        description,
        execution_plan,
        indicators,
        responsible,
        due_date,
        status,
        files,
        created_at,
        updated_at
      FROM action_plans
      WHERE id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0] || null;
  }

  // ============================================================
  // BUSCAR PLANOS POR CONTRATO
  // ============================================================

  async findByContract(contractId) {
    const sql = `
      SELECT
        id,
        contract_id,
        description,
        execution_plan,
        indicators,
        responsible,
        due_date,
        status,
        files,
        created_at,
        updated_at
      FROM action_plans
      WHERE contract_id = $1
      ORDER BY due_date ASC NULLS LAST, created_at DESC;
    `;

    const { rows } = await pool.query(sql, [contractId]);

    return rows;
  }

  // ============================================================
  // CRIAR PLANO DE AÇÃO
  // ============================================================

  async create(data) {
    const sql = `
      INSERT INTO action_plans (
        contract_id,
        description,
        execution_plan,
        indicators,
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
        $7,
        $8::jsonb
      )
      RETURNING
        id,
        contract_id,
        description,
        execution_plan,
        indicators,
        responsible,
        due_date,
        status,
        files,
        created_at,
        updated_at;
    `;

    const values = [
      data.contract_id,
      data.description,
      data.execution_plan ?? null,
      data.indicators ?? null,
      data.responsible ?? null,
      data.due_date || null,
      data.status ?? "A fazer",
      JSON.stringify(
        Array.isArray(data.files)
          ? data.files
          : []
      ),
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0] || null;
  }

  // ============================================================
  // ATUALIZAR PLANO DE AÇÃO
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
        indicators = $4,
        responsible = $5,
        due_date = $6,
        status = $7,
        files = $8::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING
        id,
        contract_id,
        description,
        execution_plan,
        indicators,
        responsible,
        due_date,
        status,
        files,
        created_at,
        updated_at;
    `;

    const values = [
      data.contract_id ?? current.contract_id,

      data.description ??
        current.description,

      data.execution_plan !== undefined
        ? data.execution_plan
        : current.execution_plan,

      data.indicators !== undefined
        ? data.indicators
        : current.indicators,

      data.responsible !== undefined
        ? data.responsible
        : current.responsible,

      data.due_date !== undefined
        ? data.due_date || null
        : current.due_date,

      data.status ??
        current.status ??
        "A fazer",

      JSON.stringify(
        data.files !== undefined
          ? data.files
          : current.files || []
      ),

      id,
    ];

    const { rows } = await pool.query(
      sql,
      values
    );

    return rows[0] || null;
  }

  // ============================================================
  // EXCLUIR PLANO DE AÇÃO
  // ============================================================

  async delete(id) {
    const sql = `
      DELETE FROM action_plans
      WHERE id = $1
      RETURNING id;
    `;

    const { rows } = await pool.query(
      sql,
      [id]
    );

    return rows[0] || null;
  }

  // ============================================================
  // ARQUIVOS
  // ============================================================

  async getFiles(actionId) {
    const sql = `
      SELECT files
      FROM action_plans
      WHERE id = $1;
    `;

    const { rows } = await pool.query(
      sql,
      [actionId]
    );

    if (!rows.length) {
      return [];
    }

    return Array.isArray(rows[0].files)
      ? rows[0].files
      : [];
  }

  // ============================================================
  // BUSCAR ARQUIVO
  // ============================================================

  async getFile(actionId, fileId) {
    const files = await this.getFiles(
      actionId
    );

    return (
      files.find(
        (file) =>
          String(file.id) ===
          String(fileId)
      ) || null
    );
  }

  // ============================================================
  // ADICIONAR ARQUIVO
  // ============================================================

  async addFile(actionId, file) {
    const sql = `
      UPDATE action_plans
      SET
        files =
          COALESCE(files, '[]'::jsonb)
          || $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
    `;

    const { rows } = await pool.query(
      sql,
      [
        JSON.stringify([file]),
        actionId,
      ]
    );

    return rows[0]?.files || [];
  }

  // ============================================================
  // REMOVER ARQUIVO
  // ============================================================

  async removeFile(actionId, fileId) {
    const files = await this.getFiles(
      actionId
    );

    const updatedFiles = files.filter(
      (file) =>
        String(file.id) !==
        String(fileId)
    );

    const sql = `
      UPDATE action_plans
      SET
        files = $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
    `;

    const { rows } = await pool.query(
      sql,
      [
        JSON.stringify(updatedFiles),
        actionId,
      ]
    );

    return rows[0]?.files || [];
  }

  // ============================================================
  // SUBSTITUIR TODOS OS ARQUIVOS
  // ============================================================

  async replaceFiles(actionId, files) {
    const sql = `
      UPDATE action_plans
      SET
        files = $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
    `;

    const { rows } = await pool.query(
      sql,
      [
        JSON.stringify(
          Array.isArray(files)
            ? files
            : []
        ),
        actionId,
      ]
    );

    return rows[0]?.files || [];
  }
}

export default new ActionRepository();