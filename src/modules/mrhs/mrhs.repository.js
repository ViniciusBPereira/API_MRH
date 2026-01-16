import pool from "../../config/db.js";

/**
 * Lista branca de colunas permitidas na tabela MRHS
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
]);

/**
 * Normaliza payload vindo da API
 */
function normalizarDados(data, contexto = "DESCONHECIDO") {
  const normalizado = {};

  for (const [key, value] of Object.entries(data)) {
    const coluna = key.toLowerCase();

    if (!COLUNAS_PERMITIDAS.has(coluna)) {
      continue;
    }

    // 🔎 LOG EXPLÍCITO PARA ENDEREÇO
    if (coluna === "ad_endereco") {
      console.log(
        `[REPO][${contexto}] AD_ENDERECO recebido:`,
        JSON.stringify(value)
      );
    }

    // NÃO descartar endereço aqui — isso já foi tratado no service
    if (coluna === "ad_endereco" && (value === null || value === "")) {
      console.warn(`[REPO][${contexto}] AD_ENDERECO vazio — ignorado`);
      continue;
    }

    normalizado[coluna] = value;
  }

  if ("ad_endereco" in data && !("ad_endereco" in normalizado)) {
    console.warn(
      `[REPO][${contexto}] AD_ENDERECO FOI DESCARTADO NA NORMALIZAÇÃO`
    );
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
  console.log(`[REPO][INSERT] AD_ID=${data.AD_ID} iniciando insert`);

  const dados = normalizarDados(data, "INSERT");
  const columns = Object.keys(dados);
  const values = Object.values(dados);

  if (columns.length === 0) {
    console.warn(
      `[REPO][INSERT] AD_ID=${data.AD_ID} sem dados após normalização`
    );
    return;
  }

  console.log(`[REPO][INSERT] AD_ID=${data.AD_ID} colunas:`, columns);

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO mrhs (${columns.join(", ")})
    VALUES (${placeholders})
  `;

  await pool.query(query, values);

  console.log(`[REPO][INSERT] AD_ID=${data.AD_ID} finalizado`);
}

/**
 * Atualiza um MRH existente pelo AD_ID
 */
export async function updateByAdId(adId, data) {
  console.log(`[REPO][UPDATE] AD_ID=${adId} iniciando update`);

  const dados = normalizarDados(data, "UPDATE");
  const keys = Object.keys(dados);
  const values = Object.values(dados);

  if (keys.length === 0) {
    console.warn(`[REPO][UPDATE] AD_ID=${adId} sem dados após normalização`);
    return;
  }

  console.log(`[REPO][UPDATE] AD_ID=${adId} campos atualizados:`, keys);

  const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    UPDATE mrhs
    SET ${sets}
    WHERE ad_id = $${keys.length + 1}
  `;

  await pool.query(query, [...values, adId]);

  console.log(`[REPO][UPDATE] AD_ID=${adId} finalizado`);
}

/**
 * Marca MRHs como encerradas quando não retornam mais da API
 */
export async function marcarEncerradas(adIds) {
  if (!adIds || adIds.length === 0) return;

  console.log(`[REPO][ENCERRAR] Encerrando ${adIds.length} MRHs`);

  const query = `
    UPDATE mrhs
    SET encerrado = true
    WHERE ad_id = ANY($1::int[])
  `;

  await pool.query(query, [adIds]);
}
