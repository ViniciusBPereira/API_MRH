import pool from "../../config/db.js";

class ContractRepository {
  // ============================================================
  // LISTAR TODOS OS CONTRATOS
  // ============================================================

  async findAll() {
    const sql = `
      SELECT
        id,
        contract,
        client,
        unit,
        business_partner,
        leadership_responsible,
        headcount,
        created_at,
        updated_at
      FROM contracts
      ORDER BY contract ASC;
    `;

    const { rows } = await pool.query(sql);

    return rows;
  }

  // ============================================================
  // BUSCAR CONTRATO POR ID
  // ============================================================

  async findById(id) {
    const sql = `
      SELECT
        id,
        contract,
        client,
        unit,
        business_partner,
        leadership_responsible,
        headcount,
        created_at,
        updated_at
      FROM contracts
      WHERE id = $1;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0] || null;
  }

  // ============================================================
  // BUSCAR CONTRATO PELO NÚMERO/NOME DO CONTRATO
  // ============================================================

  async findByContract(contract) {
    const sql = `
      SELECT
        id,
        contract,
        client,
        unit,
        business_partner,
        leadership_responsible,
        headcount,
        created_at,
        updated_at
      FROM contracts
      WHERE contract = $1
      LIMIT 1;
    `;

    const { rows } = await pool.query(sql, [contract]);

    return rows[0] || null;
  }

  // ============================================================
  // BUSCAR CONTRATO PELO BUSINESS PARTNER
  // ============================================================

  async findByBusinessPartner(businessPartner) {
    const sql = `
      SELECT
        id,
        contract,
        client,
        unit,
        business_partner,
        leadership_responsible,
        headcount,
        created_at,
        updated_at
      FROM contracts
      WHERE business_partner = $1
      ORDER BY contract ASC;
    `;

    const { rows } = await pool.query(sql, [businessPartner]);

    return rows;
  }

  // ============================================================
  // CRIAR CONTRATO
  // ============================================================

  async create(data) {
    const sql = `
      INSERT INTO contracts (
        contract,
        client,
        unit,
        business_partner,
        leadership_responsible,
        headcount
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING
        id,
        contract,
        client,
        unit,
        business_partner,
        leadership_responsible,
        headcount,
        created_at,
        updated_at;
    `;

    const values = [
      data.contract,
      data.client ?? null,
      data.unit ?? null,
      data.business_partner,
      data.leadership_responsible ?? null,
      data.headcount ?? null,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0];
  }

  // ============================================================
  // ATUALIZAR CONTRATO
  // ============================================================

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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING
        id,
        contract,
        client,
        unit,
        business_partner,
        leadership_responsible,
        headcount,
        created_at,
        updated_at;
    `;

    const values = [
      data.contract,
      data.client ?? null,
      data.unit ?? null,
      data.business_partner,
      data.leadership_responsible ?? null,
      data.headcount ?? null,
      id,
    ];

    const { rows } = await pool.query(sql, values);

    return rows[0] || null;
  }

  // ============================================================
  // EXCLUIR CONTRATO
  // ============================================================

  async delete(id) {
    const sql = `
      DELETE FROM contracts
      WHERE id = $1
      RETURNING id;
    `;

    const { rows } = await pool.query(sql, [id]);

    return rows[0] || null;
  }

  // ============================================================
  // CONTAR CONTRATOS
  // ============================================================

  async count() {
    const sql = `
      SELECT COUNT(*)::integer AS total
      FROM contracts;
    `;

    const { rows } = await pool.query(sql);

    return rows[0].total;
  }

  // ============================================================
  // VERIFICAR SE CONTRATO JÁ EXISTE
  // ============================================================

  async existsByContract(contract, excludeId = null) {
    let sql = `
      SELECT 1
      FROM contracts
      WHERE contract = $1
    `;

    const values = [contract];

    if (excludeId) {
      sql += ` AND id <> $2`;
      values.push(excludeId);
    }

    sql += ` LIMIT 1;`;

    const { rows } = await pool.query(sql, values);

    return rows.length > 0;
  }

  // ============================================================
  // VERIFICAR SE BUSINESS PARTNER JÁ ESTÁ VINCULADO AO CONTRATO
  // ============================================================

  async existsByBusinessPartner(businessPartner, excludeId = null) {
    let sql = `
      SELECT 1
      FROM contracts
      WHERE business_partner = $1
    `;

    const values = [businessPartner];

    if (excludeId) {
      sql += ` AND id <> $2`;
      values.push(excludeId);
    }

    sql += ` LIMIT 1;`;

    const { rows } = await pool.query(sql, values);

    return rows.length > 0;
  }
}

export default new ContractRepository();
