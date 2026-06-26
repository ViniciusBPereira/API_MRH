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

  async findByContract(contract) {
    const sql = `
            SELECT *
            FROM actions
            WHERE contract = $1
            ORDER BY due_date;
        `;

    const { rows } = await pool.query(sql, [contract]);

    return rows;
  }

  async create(data) {
    const sql = `
            INSERT INTO actions (
                visit_id,
                contract,
                description,
                execution,
                indicators,
                owner,
                due_date,
                stage
            )
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8
            )
            RETURNING *;
        `;

    const values = [
      data.visit_id,
      data.contract,
      data.description,
      data.execution,
      data.indicators,
      data.owner,
      data.due_date,
      data.stage,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async update(id, data) {
    const sql = `
            UPDATE actions
            SET
                visit_id = $1,
                contract = $2,
                description = $3,
                execution = $4,
                indicators = $5,
                owner = $6,
                due_date = $7,
                stage = $8,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *;
        `;

    const values = [
      data.visit_id,
      data.contract,
      data.description,
      data.execution,
      data.indicators,
      data.owner,
      data.due_date,
      data.stage,
      id,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  async delete(id) {
    await pool.query(`DELETE FROM actions WHERE id = $1`, [id]);

    return true;
  }
}

export default new ActionRepository();
