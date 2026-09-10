import EmaeService from "./emae.service.js";

class EmaeController {
  // ============================================================
  // MONITORAMENTO EMAE - SABARÁ
  //
  // hourOffset:
  //  0  = hora atual
  // -1  = hora anterior
  // -2  = duas horas atrás
  //
  // Limite atual: últimas 24 horas.
  // ============================================================
  async getSabaraMonitoring(req, res) {
    try {
      let windowOffset =
        Number.parseInt(
          req.query.windowOffset ?? "0",
          10,
        );

      if (!Number.isInteger(windowOffset)) {
        windowOffset = 0;
      }

      const data =
        await EmaeService.getMonitoring(
          "92296",
          Math.max(windowOffset, 0),
        );

      return res.status(200).json({
        sucesso: true,
        data,
      });
    } catch (error) {
      console.error(
        "❌ Erro no monitoramento EMAE SABARÁ:",
        error,
      );

      return res.status(500).json({
        sucesso: false,
        mensagem:
          "Não foi possível consultar o monitoramento da unidade SABARÁ.",
        erro:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }

  async health(req, res) {
    return res.status(200).json({
      sucesso: true,
      modulo: "EMAE",
      unidade: "SABARÁ",
      cr: "92296",
      status: "ONLINE",
      timestamp: new Date().toISOString(),
    });
  }
}

export default new EmaeController();

