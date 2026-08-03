import pool from "../../config/db.js";

class ActionRepository {
  async findAll() {
    const sql = `
      SELECT *
      FROM actions
      ORDER BY due_date;
    `;

    const { rows } = await pool.query(sql);

    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT *
      FROM actions
      WHERE id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0];
  }

  async findByVisit(visitId) {
    const sql = `
      SELECT *
      FROM actions
      WHERE visit_id = $1
      ORDER BY due_date;
    `;

    const { rows } = await pool.query(sql, [visitId]);

    return rows;
  }

  async findByContract(cr) {
    const sql = `
      SELECT *
      FROM actions
      WHERE cr = $1
      ORDER BY due_date;
    `;

    const { rows } = await pool.query(sql, [cr]);

    return rows;
  }

  async getOrCreateVisit(data) {
  const visitQuery = `
    SELECT id
    FROM visits
    WHERE cr = $1
    ORDER BY visit_date DESC NULLS LAST,
             created_at DESC NULLS LAST
    LIMIT 1;
  `;

  const { rows } = await pool.query(visitQuery, [data.cr]);

  // Se já existe uma visita para o contrato, utiliza ela
  if (rows.length > 0) {
    return rows[0].id;
  }

  // Caso não exista, cria uma visita automaticamente
  const insertVisit = `
    INSERT INTO visits (
      visit_date,
      pec,
      cr,
      client,
      unit,
      bp,
      leadership_name,
      headcount,
      employees_approached,
      turnover,
      absenteeism,
      he_inefficiency,
      open_positions,
      replacement_days,
      labor_actions,
      warnings,
      enps,
      root_cause,
      evidence,
      overview,
      leadership_score,
      climate_score,
      structure_score,
      customer_score,
      indicator_score,
      pillar_score,
      final_score,
      classification,
      priority,
      executive_opinion,
      action_plan
    )
    VALUES (
      CURRENT_DATE,
      NULL,
      $1,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '[]'::jsonb
    )
    RETURNING id;
  `;

  const result = await pool.query(insertVisit, [data.cr]);

  return result.rows[0].id;
}

  async create(data) {
    const visitId = await this.getOrCreateVisit(data);

    const sql = `
      INSERT INTO actions (
        visit_id,
        cr,
        description,
        execution,
        indicators,
        owner,
        due_date,
        stage,
        action_type,
        files
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      )
      RETURNING *;
    `;

    const values = [
      visitId,
      data.cr,
      data.description,
      data.execution,
      data.indicators,
      data.owner,
      data.due_date,
      data.stage,
      data.action_type ?? "PLANO",
      JSON.stringify(data.files || [])
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async update(id, data) {
    const visitId = await this.getOrCreateVisit(data);

    const current = await this.findById(id);

    const sql = `
      UPDATE actions
      SET
        visit_id = $1,
        cr = $2,
        description = $3,
        execution = $4,
        indicators = $5,
        owner = $6,
        due_date = $7,
        stage = $8,
        action_type = $9,
        files = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *;
    `;

    const values = [
      visitId,
      data.cr,
      data.description,
      data.execution,
      data.indicators,
      data.owner,
      data.due_date,
      data.stage,
      data.action_type ?? current.action_type ?? "PLANO",
      JSON.stringify(data.files ?? current.files ?? []),
      id
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async delete(id) {
    await pool.query(
      `
      DELETE FROM actions
      WHERE id = $1
      `,
      [id]
    );

    return true;
  }

  // ============================
  // Arquivos
  // ============================

  async getFiles(actionId) {
    const { rows } = await pool.query(
      `
      SELECT files
      FROM actions
      WHERE id = $1
      `,
      [actionId]
    );

    if (!rows.length) {
      return [];
    }

    return rows[0].files || [];
  }

  async getFile(actionId, fileId) {
    const files = await this.getFiles(actionId);

    return files.find(file => file.id === fileId) || null;
  }

  async addFile(actionId, file) {
    const sql = `
      UPDATE actions
      SET
        files = COALESCE(files, '[]'::jsonb) || $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
    `;

    const { rows } = await pool.query(sql, [
      JSON.stringify([file]),
      actionId
    ]);

    return rows[0].files;
  }

  async removeFile(actionId, fileId) {
    const files = await this.getFiles(actionId);

    const updatedFiles = files.filter(file => file.id !== fileId);

    const { rows } = await pool.query(
      `
      UPDATE actions
      SET
        files = $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
      `,
      [
        JSON.stringify(updatedFiles),
        actionId
      ]
    );

    return rows[0].files;
  }

  async replaceFiles(actionId, files) {
    const { rows } = await pool.query(
      `
      UPDATE actions
      SET
        files = $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING files;
      `,
      [
        JSON.stringify(files),
        actionId
      ]
    );

    return rows[0].files;
  }
}

export default new ActionRepository();
