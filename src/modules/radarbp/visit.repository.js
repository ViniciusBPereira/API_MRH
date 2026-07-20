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
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31
      )
      RETURNING *;
    `;

    const values = [
      data.visit_date,
      data.pec,
      data.cr,
      data.client,
      data.unit,
      data.bp,
      data.leadership_name,
      data.headcount,
      data.employees_approached,
      data.turnover,
      data.absenteeism,
      data.he_inefficiency,
      data.open_positions,
      data.replacement_days,
      data.labor_actions,
      data.warnings,
      data.enps,
      data.root_cause,
      data.evidence,
      data.overview,
      data.leadership_score,
      data.climate_score,
      data.structure_score,
      data.customer_score,
      data.indicator_score,
      data.pillar_score,
      data.final_score,
      data.classification,
      data.priority,
      data.executive_opinion,
      JSON.stringify(data.action_plan),
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async update(id, data) {
    const sql = `
      UPDATE visits
      SET
        visit_date = $1,
        pec = $2,
        cr = $3,
        client = $4,
        unit = $5,
        bp = $6,
        leadership_name = $7,
        headcount = $8,
        employees_approached = $9,
        turnover = $10,
        absenteeism = $11,
        he_inefficiency = $12,
        open_positions = $13,
        replacement_days = $14,
        labor_actions = $15,
        warnings = $16,
        enps = $17,
        root_cause = $18,
        evidence = $19,
        overview = $20,
        leadership_score = $21,
        climate_score = $22,
        structure_score = $23,
        customer_score = $24,
        indicator_score = $25,
        pillar_score = $26,
        final_score = $27,
        classification = $28,
        priority = $29,
        executive_opinion = $30,
        action_plan = $31,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $32
      RETURNING *;
    `;

    const values = [
      data.visit_date,
      data.pec,
      data.cr,
      data.client,
      data.unit,
      data.bp,
      data.leadership_name,
      data.headcount,
      data.employees_approached,
      data.turnover,
      data.absenteeism,
      data.he_inefficiency,
      data.open_positions,
      data.replacement_days,
      data.labor_actions,
      data.warnings,
      data.enps,
      data.root_cause,
      data.evidence,
      data.overview,
      data.leadership_score,
      data.climate_score,
      data.structure_score,
      data.customer_score,
      data.indicator_score,
      data.pillar_score,
      data.final_score,
      data.classification,
      data.priority,
      data.executive_opinion,
      JSON.stringify(data.action_plan),
      id,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async delete(id) {
    await pool.query(
      "DELETE FROM visits WHERE id = $1",
      [id]
    );

    return true;
  }
}

export default new VisitRepository();
