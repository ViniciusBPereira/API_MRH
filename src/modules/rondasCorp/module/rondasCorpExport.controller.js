import * as service from "./rondasCorpExport.service.js";

/**
 * =====================================================
 * FUNÇÕES AUXILIARES
 * =====================================================
 */

/**
 * Ajusta automaticamente a dataFim quando o intervalo
 * de horas cruza a meia-noite.
 *
 * Ex:
 * dataInicio = 2026-02-02
 * horaInicio = 22:00
 * dataFim    = 2026-02-02
 * horaFim    = 06:00
 *
 * 👉 dataFim vira 2026-02-03
 */
function ajustarViradaDeDia(dataInicio, dataFim, horaInicio, horaFim) {
  if (!dataInicio || !dataFim || !horaInicio || !horaFim) {
    return dataFim;
  }

  // Só ajusta se for o mesmo dia e a hora "voltar"
  if (dataInicio === dataFim && horaFim < horaInicio) {
    const d = new Date(dataFim);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  return dataFim;
}

/**
 * =====================================================
 * GET /rondas
 * =====================================================
 * Lista rondas para o frontend (JSON)
 *
 * 🔒 FILTRADO PELO CR DO PERFIL (TOKEN)
 * 📅 FILTRO OPCIONAL POR DATA
 * ⏰ FILTRO OPCIONAL POR HORA
 * 🧭 FILTRO OPCIONAL POR ROTEIRO
 */
export async function listar(req, res) {
  try {
    let {
      limit = 50,
      offset = 0,
      dataInicio,
      dataFim,
      horaInicio,
      horaFim,
      roteiro,
    } = req.query;

    // 🔐 CR vem do token
    const cr = req.user?.cr;
    if (!cr) {
      return res.status(403).json({
        error: "CR do perfil não encontrado",
      });
    }

    // ===============================
    // Normalizações
    // ===============================
    limit = Number(limit);
    offset = Number(offset);

    dataInicio = dataInicio || null;
    dataFim = dataFim || null;
    horaInicio = horaInicio || null;
    horaFim = horaFim || null;
    roteiro = roteiro || null;

    // ===============================
    // Ajuste automático de virada de dia
    // ===============================
    dataFim = ajustarViradaDeDia(dataInicio, dataFim, horaInicio, horaFim);

    const dados = await service.listarRondas({
      cr,
      limit,
      offset,
      dataInicio,
      dataFim,
      horaInicio,
      horaFim,
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
 * =====================================================
 * GET /rondas/export/csv
 * =====================================================
 * Exporta rondas em CSV
 *
 * 🔒 FILTRADO PELO CR DO PERFIL (TOKEN)
 * 📅 FILTRO OPCIONAL POR DATA
 * ⏰ FILTRO OPCIONAL POR HORA
 * 🧭 FILTRO OPCIONAL POR ROTEIRO
 */
export async function exportarCsv(req, res) {
  try {
    let { dataInicio, dataFim, horaInicio, horaFim, roteiro } = req.query;

    const cr = req.user?.cr;
    if (!cr) {
      return res.status(403).json({
        error: "CR do perfil não encontrado",
      });
    }

    dataInicio = dataInicio || null;
    dataFim = dataFim || null;
    horaInicio = horaInicio || null;
    horaFim = horaFim || null;
    roteiro = roteiro || null;

    // Ajuste de virada de dia também no CSV
    dataFim = ajustarViradaDeDia(dataInicio, dataFim, horaInicio, horaFim);

    const csv = await service.gerarCsvRondas({
      cr,
      dataInicio,
      dataFim,
      horaInicio,
      horaFim,
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
 * =====================================================
 * GET /rondas/ultima-sincronizacao
 * =====================================================
 * Informação global de sincronização
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
