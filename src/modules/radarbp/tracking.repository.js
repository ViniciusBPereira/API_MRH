import pool from "../../config/db.js";

class TrackingRepository {

  async findAll() {
    const sql = `
      SELECT *
      FROM tracking
      ORDER BY month DESC;
    `;

    const { rows } = await pool.query(sql);

    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT *
      FROM tracking
      WHERE id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0];
  }

  async findByContract(cr) {
    const sql = `
      SELECT *
      FROM tracking
      WHERE cr = $1
      ORDER BY month DESC;
    `;

    const { rows } = await pool.query(sql, [cr]);

    return rows;
  }

  /**
   * Dados utilizados na tela de edição.
   * Retorna informações do acompanhamento + visita.
   */
  async findEditData(id) {
    const sql = `
      SELECT
    t.id AS tracking_id,
    t.month,
    t.notes,
    v.*
      FROM tracking t
      INNER JOIN visits v
        ON v.cr = t.cr
       AND TO_CHAR(v.visit_date,'YYYY-MM') = t.month
      WHERE t.id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0];
  }

  async create(data) {
    const sql = `
      INSERT INTO tracking (
        month,
        cr,
        turnover,
        absenteeism,
        he_inefficiency,
        labor_actions,
        replacement_days,
        headcount,
        notes
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )
      RETURNING *;
    `;

    const values = [
      data.month,
      data.cr,
      data.turnover,
      data.absenteeism,
      data.he_inefficiency,
      data.labor_actions,
      data.replacement_days,
      data.headcount,
      data.notes,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async update(id, data) {
    const sql = `
      UPDATE tracking
      SET
        month = $1,
        cr = $2,
        turnover = $3,
        absenteeism = $4,
        he_inefficiency = $5,
        labor_actions = $6,
        replacement_days = $7,
        headcount = $8,
        notes = $9
      WHERE id = $10
      RETURNING *;
    `;

    const values = [
      data.month,
      data.cr,
      data.turnover,
      data.absenteeism,
      data.he_inefficiency,
      data.labor_actions,
      data.replacement_days,
      data.headcount,
      data.notes,
      id,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  /**
   * Atualiza Tracking e Visita em uma única transação.
   */
  async updateEdit(id, data) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const tracking = await client.query(
  `
  SELECT *
  FROM tracking
  WHERE id = $1
  `,
  [id]
);

const oldTracking = tracking.rows[0];

      // Atualiza Tracking
      await client.query(
        `
        UPDATE tracking
        SET
          month = $1,
          cr = $2,
          turnover = $3,
          absenteeism = $4,
          he_inefficiency = $5,
          labor_actions = $6,
          replacement_days = $7,
          headcount = $8,
          notes = $9
        WHERE id = $10
        `,
        [
          data.visit_date.substring(0, 7),
          data.cr,
          data.turnover,
          data.absenteeism,
          data.he_inefficiency,
          data.labor_actions,
          data.replacement_days,
          data.headcount,
          data.overview,
          id,
        ]
      );

      // Atualiza Visita
      await client.query(
        `
        UPDATE visits
        SET
          visit_date = $1,
          cr = $2,
          client = $3,
          unit = $4,
          bp = $5,
          leadership_name = $6,
          headcount = $7,
          employees_approached = $8,
          turnover = $9,
          absenteeism = $10,
          he_inefficiency = $11,
          open_positions = $12,
          replacement_days = $13,
          labor_actions = $14,
          warnings = $15,
          enps = $16,
          root_cause = $17,
          evidence = $18,
          overview = $19,
          leadership_score = $20,
          climate_score = $21,
          structure_score = $22,
          customer_score = $23,
          indicator_score = $24,
          pillar_score = $25,
          final_score = $26,
          classification = $27,
          priority = $28,
          executive_opinion = $29,
          action_plan = $30,
          updated_at = CURRENT_TIMESTAMP
        WHERE cr = $31
          AND TO_CHAR(visit_date,'YYYY-MM') = $32
        `,
        [
          data.visit_date,
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
          data.cr,
          oldTracking.month,
        ]
      );

      await client.query("COMMIT");

      return await this.findEditData(id);

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    await pool.query(
      `DELETE FROM tracking WHERE id = $1`,
      [id]
    );

    return true;
  }
}

export default new TrackingRepository();
