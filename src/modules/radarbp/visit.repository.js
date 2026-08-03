import pool from "../../config/db.js";

class VisitRepository {
  async findAll() {
    const sql = `
      SELECT *
      FROM visits
      ORDER BY visit_date DESC;
    `;

    const { rows } = await pool.query(sql);

    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT *
      FROM visits
      WHERE id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0];
  }

  async findByPec(pec) {
    const sql = `
      SELECT *
      FROM visits
      WHERE pec = $1
      ORDER BY visit_date DESC;
    `;

    const { rows } = await pool.query(sql, [pec]);

    return rows;
  }

  async create(data) {
    const sql = `
      INSERT INTO visits (
        visit_date,
        cr,
        pec,
        client,
        unit,
        bp,
        leadership_name,
        employees_approached,
        warnings,
        enps,
        root_cause,
        evidence,
        overview,
        leadership_score,
        climate_score,
        structure_score,
        customer_score,
        pillar_score,
        final_score,
        classification,
        priority,
        executive_opinion,
        action_plan
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23
      )
      RETURNING *;
    `;

    const values = [
      data.visit_date,
      data.cr,
      data.pec,
      data.client,
      data.unit,
      data.bp,
      data.leadership_name,
      data.employees_approached,
      data.warnings,
      data.enps,
      data.root_cause,
      data.evidence,
      data.overview,
      data.leadership_score,
      data.climate_score,
      data.structure_score,
      data.customer_score,
      data.pillar_score,
      data.final_score,
      data.classification,
      data.priority,
      data.executive_opinion,
      JSON.stringify(data.action_plan ?? []),
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async update(id, data) {
    const sql = `
      UPDATE visits
      SET
        visit_date = $1,
        cr = $2,
        pec = $3,
        client = $4,
        unit = $5,
        bp = $6,
        leadership_name = $7,
        employees_approached = $8,
        warnings = $9,
        enps = $10,
        root_cause = $11,
        evidence = $12,
        overview = $13,
        leadership_score = $14,
        climate_score = $15,
        structure_score = $16,
        customer_score = $17,
        pillar_score = $18,
        final_score = $19,
        classification = $20,
        priority = $21,
        executive_opinion = $22,
        action_plan = $23,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $24
      RETURNING *;
    `;

    const values = [
      data.visit_date,
      data.cr,
      data.pec,
      data.client,
      data.unit,
      data.bp,
      data.leadership_name,
      data.employees_approached,
      data.warnings,
      data.enps,
      data.root_cause,
      data.evidence,
      data.overview,
      data.leadership_score,
      data.climate_score,
      data.structure_score,
      data.customer_score,
      data.pillar_score,
      data.final_score,
      data.classification,
      data.priority,
      data.executive_opinion,
      JSON.stringify(data.action_plan ?? []),
      id,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async delete(id) {
    await pool.query(
      `
      DELETE FROM visits
      WHERE id = $1
      `,
      [id]
    );

    return true;
  }
}

export default new VisitRepository();
