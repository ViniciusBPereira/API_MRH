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

  async findByContract(contract) {
    const sql = `
            SELECT *
            FROM tracking
            WHERE contract = $1
            ORDER BY month DESC;
        `;

    const { rows } = await pool.query(sql, [contract]);

    return rows;
  }

  async create(data) {
    const sql = `
            INSERT INTO tracking (
                month,
                contract,
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
      data.contract,
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
                contract = $2,
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
      data.contract,
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

  async delete(id) {
    await pool.query(`DELETE FROM tracking WHERE id = $1`, [id]);

    return true;
  }
}

export default new TrackingRepository();
