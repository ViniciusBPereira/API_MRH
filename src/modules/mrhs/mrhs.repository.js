import pool from "../../config/db.js";

/**
 * Lista branca de colunas permitidas na tabela MRHS
 * (protege contra campos inesperados da API)
 */
const COLUNAS_PERMITIDAS = new Set([
  "ad_id",
  "ad_endereco",
  "cr",
  "desccr",
  "bairrocr",
  "municipiocr",
  "estadocr",
  "cepcr",
  "centro_custo",
  "vaga_publicada_gpsvc",
  "vaga_configurada_gpsvc",
  "check_processo_rh",
  "check_processo_dp",
  "status_rh",
  "status_dp",
  "data_registro",
  "data_inicio_contrato",
  "data_limite_recrutamento",
  "encerrado",
  // 👉 mantenha aqui apenas colunas reais da tabela
]);

/**
 * Normaliza payload vindo da API
 */
function normalizarDados(data) {
  const normalizado = {};

  for (const [key, value] of Object.entries(data)) {
    const coluna = key.toLowerCase();

    if (!COLUNAS_PERMITIDAS.has(coluna)) continue;

    // Não sobrescrever endereço válido
    if (
      coluna === "ad_endereco" &&
      (value === null || value === "" || value === "0")
    ) {
      continue;
    }

    normalizado[coluna] = value;
  }

  return normalizado;
}

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
  const dados = normalizarDados(data);
  const columns = Object.keys(dados);
  const values = Object.values(dados);

  if (columns.length === 0) return;

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO mrhs (${columns.join(", ")})
    VALUES (${placeholders})
  `;

  await pool.query(query, values);
}

/**
 * Atualiza um MRH existente pelo AD_ID
 */
export async function updateByAdId(adId, data) {
  const dados = normalizarDados(data);
  const keys = Object.keys(dados);
  const values = Object.values(dados);

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
