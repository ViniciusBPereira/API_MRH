
import pool from "../../config/db.js";

/* =====================================================
   COLUNAS DOS CONTRATOS
===================================================== */

const SELECT_COLUMNS = `
  id,
  contract,
  client,
  unit,
  business_partner,
  leadership_responsible,
  headcount,
  monitoring_status,
  status_observation,
  created_at,
  updated_at
`;

/* =====================================================
   REPOSITORY
===================================================== */

class ContractRepository {
  // ==================================================
  // LISTAR CONTRATOS
  // ==================================================

  async findAll() {
    const { rows } = await pool.query(`
      SELECT ${SELECT_COLUMNS}
      FROM contracts
      ORDER BY
        contract ASC,
        business_partner ASC;
    `);

    return rows;
  }

  // ==================================================
  // BUSCAR POR ID
  // ==================================================

  async findById(id) {
    const { rows } = await pool.query(
      `
      SELECT ${SELECT_COLUMNS}
      FROM contracts
      WHERE id = $1;
      `,
      [id]
    );

    return rows[0] || null;
  }

  // ==================================================
  // BUSCAR PELO CR
  // ==================================================

  async findByContract(contract) {
    const { rows } = await pool.query(
      `
      SELECT ${SELECT_COLUMNS}
      FROM contracts
      WHERE LOWER(BTRIM(contract)) =
            LOWER(BTRIM($1))
      LIMIT 1;
      `,
      [contract]
    );

    return rows[0] || null;
  }

  // ==================================================
  // BUSCAR PELO BUSINESS PARTNER
  // ==================================================

  async findByBusinessPartner(businessPartner) {
    const { rows } = await pool.query(
      `
      SELECT ${SELECT_COLUMNS}
      FROM contracts
      WHERE LOWER(BTRIM(business_partner)) =
            LOWER(BTRIM($1))
      ORDER BY contract ASC;
      `,
      [businessPartner]
    );

    return rows;
  }

  // ==================================================
  // CRIAR CONTRATO
  // ==================================================

  async create(data) {
    const sql = `
      INSERT INTO contracts (
        contract,
        client,
        unit,
        business_partner,
        leadership_responsible,
        headcount,
        monitoring_status,
        status_observation
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING ${SELECT_COLUMNS};
    `;

    const values = [
      data.contract,
      data.client,
      data.unit,
      data.business_partner,
      data.leadership_responsible,
      data.headcount,
      data.monitoring_status,
      data.status_observation,
    ];

    const { rows } = await pool.query(
      sql,
      values
    );

    return rows[0];
  }

  // ==================================================
  // ATUALIZAR CONTRATO
  // ==================================================

  async update(id, data) {
    const sql = `
      UPDATE contracts
      SET
        contract = $1,
        client = $2,
        unit = $3,
        business_partner = $4,
        leadership_responsible = $5,
        headcount = $6,
        monitoring_status = $7,
        status_observation = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING ${SELECT_COLUMNS};
    `;

    const values = [
      data.contract,
      data.client,
      data.unit,
      data.business_partner,
      data.leadership_responsible,
      data.headcount,
      data.monitoring_status,
      data.status_observation,
      id,
    ];

    const { rows } = await pool.query(
      sql,
      values
    );

    return rows[0] || null;
  }

  // ==================================================
  // EXCLUIR CONTRATO
  // ==================================================

  async delete(id) {
    // As dependências permanecem sob as regras
    // das chaves estrangeiras do PostgreSQL.

    const { rows } = await pool.query(
      `
      DELETE FROM contracts
      WHERE id = $1
      RETURNING id;
      `,
      [id]
    );

    return rows[0] || null;
  }

  // ==================================================
  // CONTAR CONTRATOS
  // ==================================================

  async count() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::integer AS total
      FROM contracts;
    `);

    return rows[0].total;
  }

  // ==================================================
  // VERIFICAR CR DUPLICADO
  // ==================================================

  async existsByContract(
    contract,
    excludeId = null
  ) {
    const values = [contract];

    let sql = `
      SELECT 1
      FROM contracts
      WHERE LOWER(BTRIM(contract)) =
            LOWER(BTRIM($1))
    `;

    if (
      excludeId !== null &&
      excludeId !== undefined
    ) {
      sql += " AND id <> $2";
      values.push(excludeId);
    }

    sql += " LIMIT 1;";

    const { rows } = await pool.query(
      sql,
      values
    );

    return rows.length > 0;
  }

  // ==================================================
  // VERIFICAR BUSINESS PARTNER EXISTENTE
  //
  // Mantido para compatibilidade.
  // Não impede que um BP tenha vários contratos.
  // ==================================================

  async existsByBusinessPartner(
    businessPartner,
    excludeId = null
  ) {
    const values = [businessPartner];

    let sql = `
      SELECT 1
      FROM contracts
      WHERE LOWER(BTRIM(business_partner)) =
            LOWER(BTRIM($1))
    `;

    if (
      excludeId !== null &&
      excludeId !== undefined
    ) {
      sql += " AND id <> $2";
      values.push(excludeId);
    }

    sql += " LIMIT 1;";

    const { rows } = await pool.query(
      sql,
      values
    );

    return rows.length > 0;
  }
}

export default new ContractRepository();
