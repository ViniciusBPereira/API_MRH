import * as service from "./rondasCorpExport.service.js";

/**
 * GET /rondas
 * Lista rondas para o frontend (JSON)
 */
export async function listar(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const dados = await service.listarRondas({
      limit: Number(limit),
      offset: Number(offset),
    });

    res.status(200).json(dados);
  } catch (error) {
    console.error("[CONTROLLER][RONDAS] Erro ao listar rondas", error);
    res.status(500).json({
      error: "Erro ao listar rondas",
    });
  }
}

/**
 * GET /rondas/export/csv
 * Exporta rondas em CSV
 */
export async function exportarCsv(req, res) {
  try {
    const csv = await service.gerarCsvRondas();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=rondas_hospital.csv",
    );

    res.status(200).send(csv);
  } catch (error) {
    console.error("[CONTROLLER][RONDAS] Erro ao exportar CSV", error);
    res.status(500).json({
      error: "Erro ao exportar CSV",
    });
  }
}
/**
 * GET /rondas/ultima-sincronizacao
 */
export async function ultimaSincronizacao(req, res) {
  try {
    const status = await service.obterUltimaSincronizacao();

    if (!status) {
      return res.status(404).json({
        error: "Informação de sincronização não encontrada",
      });
    }

    res.status(200).json(status);
  } catch (error) {
    console.error(
      "[CONTROLLER][RONDAS] Erro ao buscar última sincronização",
      error,
    );
    res.status(500).json({
      error: "Erro ao buscar última sincronização",
    });
  }
}
