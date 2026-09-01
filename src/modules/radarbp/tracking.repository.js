import pool from "../../config/db.js";

class TrackingRepository {
  // ============================================================
  // LISTAR TODOS
  // ============================================================

  async findAll() {
    const sql = `
      SELECT
        id,
        contract_id,

        TO_CHAR(reference_month, 'YYYY-MM')
          AS reference_month,

        turnover,
        absenteeism,
        he_inefficiency,
        open_positions,
        replacement_days,
        headcount,
        labor_actions,
        notes,
        created_at,
        updated_at

      FROM tracking

      ORDER BY
        reference_month DESC,
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
      SELECT
        id,
        contract_id,

        TO_CHAR(reference_month, 'YYYY-MM')
          AS reference_month,

        turnover,
        absenteeism,
        he_inefficiency,
        open_positions,
        replacement_days,
        headcount,
        labor_actions,
        notes,
        created_at,
        updated_at

      FROM tracking

      WHERE id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0] || null;
  }

  // ============================================================
  // BUSCAR POR CONTRATO
  // ============================================================

  async findByContract(contractId) {
    const sql = `
      SELECT
        id,
        contract_id,

        TO_CHAR(reference_month, 'YYYY-MM')
          AS reference_month,

        turnover,
        absenteeism,
        he_inefficiency,
        open_positions,
        replacement_days,
        headcount,
        labor_actions,
        notes,
        created_at,
        updated_at

      FROM tracking

      WHERE contract_id = $1

      ORDER BY
        reference_month DESC,
        created_at DESC;
    `;

    const { rows } = await pool.query(sql, [contractId]);

    return rows;
  }

  // ============================================================
  // DADOS PARA EDIÇÃO
  //
  // Tracking + visita correspondente
  // ============================================================

  async findEditData(id) {
    const sql = `
      SELECT
        t.id AS tracking_id,

        t.contract_id,

        TO_CHAR(
          t.reference_month,
          'YYYY-MM'
        ) AS reference_month,

        t.turnover AS tracking_turnover,
        t.absenteeism AS tracking_absenteeism,
        t.he_inefficiency AS tracking_he_inefficiency,
        t.open_positions AS tracking_open_positions,
        t.replacement_days AS tracking_replacement_days,
        t.headcount AS tracking_headcount,
        t.labor_actions AS tracking_labor_actions,
        t.notes AS tracking_notes,

        v.*

      FROM tracking t

      LEFT JOIN visits v
        ON v.contract_id = t.contract_id

       AND TO_CHAR(
         v.visit_date,
         'YYYY-MM'
       ) = TO_CHAR(
         t.reference_month,
         'YYYY-MM'
       )

      WHERE t.id = $1

      ORDER BY
        v.visit_date DESC NULLS LAST,
        v.created_at DESC NULLS LAST

      LIMIT 1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0] || null;
  }

  // ============================================================
  // CRIAR
  // ============================================================

  async create(data) {
    const sql = `
      INSERT INTO tracking (
        contract_id,
        reference_month,
        turnover,
        absenteeism,
        he_inefficiency,
        open_positions,
        replacement_days,
        headcount,
        labor_actions,
        notes
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )

      RETURNING
        id,
        contract_id,

        TO_CHAR(
          reference_month,
          'YYYY-MM'
        ) AS reference_month,

        turnover,
        absenteeism,
        he_inefficiency,
        open_positions,
        replacement_days,
        headcount,
        labor_actions,
        notes,
        created_at,
        updated_at;
    `;

    const values = [
      data.contract_id,
      data.reference_month,
      data.turnover,
      data.absenteeism,
      data.he_inefficiency,
      data.open_positions,
      data.replacement_days,
      data.headcount,
      data.labor_actions,
      data.notes,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  // ============================================================
  // ATUALIZAR
  // ============================================================

  async update(id, data) {
    const sql = `
      UPDATE tracking

      SET
        contract_id = $1,
        reference_month = $2,
        turnover = $3,
        absenteeism = $4,
        he_inefficiency = $5,
        open_positions = $6,
        replacement_days = $7,
        headcount = $8,
        labor_actions = $9,
        notes = $10,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $11

      RETURNING
        id,
        contract_id,

        TO_CHAR(
          reference_month,
          'YYYY-MM'
        ) AS reference_month,

        turnover,
        absenteeism,
        he_inefficiency,
        open_positions,
        replacement_days,
        headcount,
        labor_actions,
        notes,
        created_at,
        updated_at;
    `;

    const values = [
      data.contract_id,
      data.reference_month,
      data.turnover,
      data.absenteeism,
      data.he_inefficiency,
      data.open_positions,
      data.replacement_days,
      data.headcount,
      data.labor_actions,
      data.notes,
      id,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0] || null;
  }

  // ============================================================
  // ATUALIZAR TRACKING + VISITA
  // ============================================================

  async updateEdit(id, data) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // ========================================================
      // BUSCAR TRACKING ATUAL
      // ========================================================

      const trackingResult = await client.query(
        `
          SELECT *
          FROM tracking
          WHERE id = $1
          FOR UPDATE;
          `,
        [id],
      );

      const oldTracking = trackingResult.rows[0];

      if (!oldTracking) {
        throw new Error("Tracking não encontrado.");
      }

      // ========================================================
      // ATUALIZAR TRACKING
      // ========================================================

      await client.query(
        `
        UPDATE tracking

        SET
          contract_id = $1,
          reference_month = $2,
          turnover = $3,
          absenteeism = $4,
          he_inefficiency = $5,
          open_positions = $6,
          replacement_days = $7,
          headcount = $8,
          labor_actions = $9,
          notes = $10,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $11;
        `,
        [
          data.contract_id,
          data.reference_month,
          data.turnover,
          data.absenteeism,
          data.he_inefficiency,
          data.open_positions,
          data.replacement_days,
          data.headcount,
          data.labor_actions,
          data.notes,
          id,
        ],
      );

      // ========================================================
      // ATUALIZAR VISITA
      //
      // Procura pela visita do contrato antigo
      // e do mesmo mês.
      // ========================================================

      await client.query(
        `
        UPDATE visits

        SET
          visit_date = $1,
          employees_approached = $2,

          turnover = $3,
          absenteeism = $4,
          he_inefficiency = $5,
          open_positions = $6,
          replacement_days = $7,

          labor_actions = $8,
          warnings = $9,
          enps = $10,

          root_cause = $11,
          evidence = $12,
          overview = $13,

          leadership_score = $14,
          climate_score = $15,
          structure_score = $16,
          customer_score = $17,

          indicator_score = $18,
          pillar_score = $19,
          final_score = $20,
          classification = $21,
          priority = $22,
          executive_opinion = $23,

          diagnosis = $24,

          updated_at = CURRENT_TIMESTAMP

        WHERE contract_id = $25

          AND TO_CHAR(
            visit_date,
            'YYYY-MM'
          ) = TO_CHAR(
            $26::date,
            'YYYY-MM'
          );
        `,
        [
          data.visit_date,
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

          data.diagnosis,

          oldTracking.contract_id,
          oldTracking.reference_month,
        ],
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

  // ============================================================
  // EXCLUIR
  // ============================================================

  async delete(id) {
    const result = await pool.query(
      `
      DELETE FROM tracking
      WHERE id = $1;
      `,
      [id],
    );

    return result.rowCount > 0;
  }
}

export default new TrackingRepository();
