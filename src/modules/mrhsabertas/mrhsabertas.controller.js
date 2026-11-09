import {
  listarMRHsAbertas,
  moverMRHParaDocumentacao,
} from "./mrhsabertas.service.js";

/**
 * Controller responsável por MRHs abertas (time = SELECAO).
 */
export async function getMRHsAbertas(req, res) {
  const controller = "MRHsAbertasController.getMRHsAbertas";
  const startTime = Date.now();

  const usuarioAtual = req.user?.nome || "Desconhecido";

  try {
    console.info(`[CONTROLLER] ${controller} - Requisição iniciada`, {
      usuario: usuarioAtual,
      rota: req.originalUrl,
      metodo: req.method,
    });

    const resultado = await listarMRHsAbertas();

    console.info(
      `[CONTROLLER] ${controller} - Requisição concluída com sucesso`,
      {
        usuario: usuarioAtual,
        total_mrhs: resultado.length,
        tempo_execucao_ms: Date.now() - startTime,
      },
    );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - Erro ao processar requisição`, {
      usuario: usuarioAtual,
      mensagem: error.message,
      stack: error.stack,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return res.status(500).json({
      message: "Erro ao buscar MRHs em aberto",
    });
  }
}
export async function salvarMelhoria(req, res) {
  // Valida os dados recebidos
  // Cria um ID e registra data/hora
  // Lê as melhorias já armazenadas
  // Acrescenta a nova sugestão
  // Salva no arquivo JSON
  // Retorna HTTP 201 quando concluir
}
/**
 * 🔹 Controller responsável por mover MRH
 * do time SELECAO para DOCUMENTACAO
 */
export async function moverMRH(req, res) {
  const controller = "MRHsAbertasController.moverMRH";
  const startTime = Date.now();

  const usuarioAtual = req.user?.nome || "Desconhecido";
  const { id } = req.params;

  try {
    console.info(`[CONTROLLER] ${controller} - Requisição iniciada`, {
      usuario: usuarioAtual,
      mrh_id: id,
      rota: req.originalUrl,
      metodo: req.method,
    });

    const resultado = await moverMRHParaDocumentacao(id);

    console.info(`[CONTROLLER] ${controller} - MRH movida com sucesso`, {
      usuario: usuarioAtual,
      mrh_id: id,
      novo_time: resultado.time,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "MRH movida para o time de Documentação",
      data: resultado,
    });
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - Erro ao mover MRH`, {
      usuario: usuarioAtual,
      mrh_id: id,
      mensagem: error.message,
      stack: error.stack,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return res.status(400).json({
      sucesso: false,
      message: error.message || "Erro ao mover MRH para Documentação",
    });
  }
}
