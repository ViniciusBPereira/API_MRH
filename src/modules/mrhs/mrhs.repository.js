import pool from "../../config/db.js";

/**
 * Retorna todos os AD_IDs atualmente NÃO encerrados no banco
 */
export async function getAdIdsAbertos() {
  const result = await pool.query(`
    SELECT ad_id
    FROM mrhs
    WHERE encerrado = false
  `);

  return result.rows.map((r) => r.ad_id);
}

/**
 * Verifica se um MRH existe pelo AD_ID
 */
export async function existsByAdId(adId) {
  const result = await pool.query(
    "SELECT 1 FROM mrhs WHERE ad_id = $1 LIMIT 1",
    [adId]
  );
  return result.rowCount > 0;
}

/**
 * Insere um novo MRH
 */
export async function insertMRH(data) {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(",");

  const query = `
    INSERT INTO mrhs (${columns.join(",")})
    VALUES (${placeholders})
  `;

  await pool.query(query, values);
}

/**
 * Atualiza um MRH existente pelo AD_ID
 */
export async function updateByAdId(adId, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);

  if (keys.length === 0) return;

  const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    UPDATE mrhs
    SET ${sets}
    WHERE ad_id = $${keys.length + 1}
  `;

  await pool.query(query, [...values, adId]);
}

/**
 * Marca MRHs como encerradas quando não retornam mais da API
 */
export async function marcarEncerradas(adIds) {
  if (!adIds || adIds.length === 0) return;

  const query = `
    UPDATE mrhs
    SET encerrado = true
    WHERE ad_id = ANY($1::int[])
  `;

  await pool.query(query, [adIds]);
}
