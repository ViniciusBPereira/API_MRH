import * as service from "./rondasCorpExport.service.js";

/**
 * GET /rondas
 * Lista rondas para o frontend (JSON)
 * 🔒 FILTRADO PELO CR DO PERFIL (TOKEN)
 * 📅 FILTRO OPCIONAL POR DATA
 * 🧭 FILTRO OPCIONAL POR ROTEIRO
 *
 * Query params:
 * - limit
 * - offset
 * - dataInicio (YYYY-MM-DD)
 * - dataFim (YYYY-MM-DD)
 * - roteiro (string, contém)
 */
export async function listar(req, res) {
  try {
    const { limit = 50, offset = 0, dataInicio, dataFim, roteiro } = req.query;

    // 🔥 CR vem EXCLUSIVAMENTE do token
    const cr = req.user?.cr;

    if (!cr) {
      return res.status(403).json({
        error: "CR do perfil não encontrado",
      });
    }

    const dados = await service.listarRondas({
      cr,
      limit: Number(limit),
      offset: Number(offset),
      dataInicio,
      dataFim,
      roteiro,
    });

    return res.status(200).json(dados);
  } catch (error) {
    console.error("[CONTROLLER][RONDAS] Erro ao listar rondas", error);

    return res.status(500).json({
      error: "Erro ao listar rondas",
    });
  }
}

/**
 * GET /rondas/export/csv
 * Exporta rondas em CSV
 * 🔒 FILTRADO PELO CR DO PERFIL (TOKEN)
 * 📅 FILTRO OPCIONAL POR DATA
 * 🧭 FILTRO OPCIONAL POR ROTEIRO
 *
 * Query params:
 * - dataInicio
 * - dataFim
 * - roteiro
 */
export async function exportarCsv(req, res) {
  try {
    const { dataInicio, dataFim, roteiro } = req.query;

    const cr = req.user?.cr;

    if (!cr) {
      return res.status(403).json({
        error: "CR do perfil não encontrado",
      });
    }

    const csv = await service.gerarCsvRondas({
      cr,
      dataInicio,
      dataFim,
      roteiro,
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=XRLssj_DLGA.csv",
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error("[CONTROLLER][RONDAS] Erro ao exportar CSV", error);

    return res.status(500).json({
      error: "Erro ao exportar CSV",
    });
  }
}

/**
 * GET /rondas/ultima-sincronizacao
 * (informação global, não depende de CR)
 */
export async function ultimaSincronizacao(req, res) {
  try {
    const status = await service.obterUltimaSincronizacao();

    if (!status) {
      return res.status(404).json({
        error: "Informação de sincronização não encontrada",
      });
    }

    return res.status(200).json(status);
  } catch (error) {
    console.error(
      "[CONTROLLER][RONDAS] Erro ao buscar última sincronização",
      error,
    );

    return res.status(500).json({
      error: "Erro ao buscar última sincronização",
    });
  }
}
