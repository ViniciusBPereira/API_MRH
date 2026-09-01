import pool from "../../config/db.js";

class VisitRepository {
  // ============================================================
  // NORMALIZAR JSONB
  // ============================================================

  normalizeJson(value, fallback = {}) {
    // null / undefined
    if (value === undefined || value === null) {
      return JSON.stringify(fallback);
    }

    // Se já for objeto/array
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (error) {
        console.error("[REPOSITORY] Erro ao serializar JSON:", error);
        throw new Error("Dados JSON inválidos.");
      }
    }

    // Se vier como string
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return JSON.stringify(fallback);
      }

      try {
        // Valida se já é JSON
        const parsed = JSON.parse(trimmed);

        return JSON.stringify(parsed);
      } catch (error) {
        console.error("[REPOSITORY] JSON inválido recebido:", value);

        throw new Error("Dados JSON inválidos.");
      }
    }

    throw new Error("Formato de JSON inválido.");
  }

  // ============================================================
  // LISTAR TODAS AS VISITAS
  // ============================================================

  async findAll() {
    const sql = `
      SELECT
        v.*,

        c.contract,
        c.client,
        c.unit,
        c.business_partner,
        c.leadership_responsible,
        c.headcount AS contract_headcount

      FROM visits v

      INNER JOIN contracts c
        ON c.id = v.contract_id

      ORDER BY
        v.visit_date DESC,
        v.created_at DESC;
    `;

    const { rows } = await pool.query(sql);

    return rows;
  }

  // ============================================================
  // BUSCAR VISITA POR ID
  // ============================================================

  async findById(id) {
    const sql = `
      SELECT
        v.*,

        c.contract,
        c.client,
        c.unit,
        c.business_partner,
        c.leadership_responsible,
        c.headcount AS contract_headcount

      FROM visits v

      INNER JOIN contracts c
        ON c.id = v.contract_id

      WHERE v.id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0] || null;
  }

  // ============================================================
  // BUSCAR VISITAS POR CONTRATO
  // ============================================================

  async findByContract(contractId) {
    const sql = `
      SELECT
        v.*,

        c.contract,
        c.client,
        c.unit,
        c.business_partner,
        c.leadership_responsible,
        c.headcount AS contract_headcount

      FROM visits v

      INNER JOIN contracts c
        ON c.id = v.contract_id

      WHERE v.contract_id = $1

      ORDER BY
        v.visit_date DESC,
        v.created_at DESC;
    `;

    const { rows } = await pool.query(sql, [contractId]);

    return rows;
  }

  // ============================================================
  // CRIAR VISITA
  // ============================================================

  async create(data) {
    const rootCauseJson = this.normalizeJson(data.root_cause, []);

    const diagnosisJson = this.normalizeJson(data.diagnosis, {});

    console.log("[REPOSITORY] root_cause JSON:", rootCauseJson);

    console.log("[REPOSITORY] diagnosis JSON:", diagnosisJson);

    const sql = `
      INSERT INTO visits (
        contract_id,
        visit_date,

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

        diagnosis
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
        $10,
        $11,

        $12::jsonb,
        $13,
        $14,

        $15,
        $16,
        $17,
        $18,

        $19,
        $20,
        $21,
        $22,
        $23,
        $24,

        $25::jsonb
      )

      RETURNING *;
    `;

    const values = [
      data.contract_id,
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

      rootCauseJson,

      data.evidence ?? "",
      data.overview ?? "",

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

      diagnosisJson,
    ];

    console.log("[REPOSITORY] CREATE VISIT values:", values);

    try {
      const { rows } = await pool.query(sql, values);

      return rows[0] || null;
    } catch (error) {
      console.error("[REPOSITORY] CREATE VISIT SQL ERROR:", error);

      console.error("[REPOSITORY] rootCauseJson:", rootCauseJson);

      console.error("[REPOSITORY] diagnosisJson:", diagnosisJson);

      throw error;
    }
  }

  // ============================================================
  // ATUALIZAR VISITA
  // ============================================================

  async update(id, data) {
    const rootCauseJson = this.normalizeJson(data.root_cause, []);

    const diagnosisJson = this.normalizeJson(data.diagnosis, {});

    const sql = `
      UPDATE visits

      SET
        contract_id = $1,
        visit_date = $2,

        employees_approached = $3,

        turnover = $4,
        absenteeism = $5,
        he_inefficiency = $6,
        open_positions = $7,
        replacement_days = $8,

        labor_actions = $9,
        warnings = $10,
        enps = $11,

        root_cause = $12::jsonb,
        evidence = $13,
        overview = $14,

        leadership_score = $15,
        climate_score = $16,
        structure_score = $17,
        customer_score = $18,

        indicator_score = $19,
        pillar_score = $20,
        final_score = $21,
        classification = $22,
        priority = $23,
        executive_opinion = $24,

        diagnosis = $25::jsonb,

        updated_at = CURRENT_TIMESTAMP

      WHERE id = $26

      RETURNING *;
    `;

    const values = [
      data.contract_id,
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

      rootCauseJson,

      data.evidence ?? "",
      data.overview ?? "",

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

      diagnosisJson,

      id,
    ];

    console.log("[REPOSITORY] UPDATE VISIT values:", values);

    try {
      const { rows } = await pool.query(sql, values);

      return rows[0] || null;
    } catch (error) {
      console.error("[REPOSITORY] UPDATE VISIT SQL ERROR:", error);

      console.error("[REPOSITORY] rootCauseJson:", rootCauseJson);

      console.error("[REPOSITORY] diagnosisJson:", diagnosisJson);

      throw error;
    }
  }

  // ============================================================
  // EXCLUIR VISITA
  // ============================================================

  async delete(id) {
    const { rows } = await pool.query(
      `
        DELETE FROM visits
        WHERE id = $1
        RETURNING id;
      `,
      [id],
    );

    return rows[0] || null;
  }

  // ============================================================
  // VERIFICAR SE CONTRATO EXISTE
  // ============================================================

  async contractExists(contractId) {
    const sql = `
      SELECT EXISTS (
        SELECT 1
        FROM contracts
        WHERE id = $1
      ) AS exists;
    `;

    const { rows } = await pool.query(sql, [contractId]);

    return rows[0].exists;
  }

  // ============================================================
  // VERIFICAR VISITA DUPLICADA
  // ============================================================

  async existsByContractAndDate(contractId, visitDate, excludeId = null) {
    const sql = `
      SELECT EXISTS (
        SELECT 1
        FROM visits
        WHERE contract_id = $1
          AND visit_date = $2
          AND (
            $3::uuid IS NULL
            OR id <> $3
          )
      ) AS exists;
    `;

    const { rows } = await pool.query(sql, [contractId, visitDate, excludeId]);

    return rows[0].exists;
  }
}

export default new VisitRepository();
