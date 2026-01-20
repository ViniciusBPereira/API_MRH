import { listarMRHsAbertas } from "./mrhsabertas.service.js";

/**
 * Controller responsável por expor a listagem de MRHs abertas.
 *
 * Responsabilidades:
 * - Extrair contexto da requisição (usuário)
 * - Chamar o service
 * - Retornar resposta HTTP adequada
 * - Gerar logs de auditoria e erro
 */
export async function getMRHsAbertas(req, res) {
  const controller = "MRHsAbertasController.getMRHsAbertas";
  const startTime = Date.now();

  // Usuário autenticado (fallback seguro)
  const usuarioAtual = req.user?.nome || "Desconhecido";

  try {
    console.info(`[CONTROLLER] ${controller} - Requisição iniciada`, {
      usuario: usuarioAtual,
      rota: req.originalUrl,
      metodo: req.method,
    });

    const resultado = await listarMRHsAbertas();

    const duration = Date.now() - startTime;

    console.info(
      `[CONTROLLER] ${controller} - Requisição concluída com sucesso`,
      {
        usuario: usuarioAtual,
        total_mrhs: resultado.length,
        tempo_execucao_ms: duration,
      }
    );

    return res.status(200).json(resultado);
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`[CONTROLLER] ${controller} - Erro ao processar requisição`, {
      usuario: usuarioAtual,
      mensagem: error.message,
      stack: error.stack,
      tempo_execucao_ms: duration,
    });

    return res.status(500).json({
      message: "Erro ao buscar MRHs em aberto",
    });
  }
}
