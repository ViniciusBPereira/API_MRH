/**
 * Cache em memória
 */
let cacheAnterior = [];

/**
 * Detecta novas NPS comparando com o cache anterior
 */
export function detectarNovasNPS(novasNPS) {
  if (!Array.isArray(novasNPS)) return [];

  /**
   * Primeira execução → não notifica
   */
  if (cacheAnterior.length === 0) {
    cacheAnterior = novasNPS;
    console.log("[CACHE] Primeira carga, sem notificação");
    return [];
  }

  /**
   * Identifica novas pelo ID
   */
  const novas = novasNPS.filter((nova) =>
    !cacheAnterior.some((antiga) => antiga.id === nova.id)
  );

  /**
   * Atualiza cache
   */
  cacheAnterior = novasNPS;

  console.log(`[CACHE] Novas NPS detectadas: ${novas.length}`);

  return novas;
}