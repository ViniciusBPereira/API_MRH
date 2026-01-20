import {
  criarComentarioMRH,
  listarComentariosMRH,
} from "./mrhscomentarios.service.js";

/**
 * Controller responsável por comentários das MRHs
 *
 * Responsabilidades:
 * - Traduzir HTTP → Service
 * - Controlar status codes
 * - Nunca conter regra de negócio
 */

/**
 * POST /api/mrhs/:mrhId/comentarios
 * Cria um novo comentário para a MRH
 */
export async function criarComentario(req, res) {
  console.log("🟦 [CONTROLLER] criarComentario - INÍCIO", {
    params: req.params,
    body: req.body,
    user: req.user,
  });

  try {
    const { mrhId } = req.params;
    const { comentario } = req.body;
    const usuario = req.user;

    console.log("🟨 [CONTROLLER] Dados normalizados", {
      mrhIdNumber: Number(mrhId),
      comentario,
      usuarioId: usuario?.id,
    });

    const comentarioCriado = await criarComentarioMRH({
      mrhId: Number(mrhId),
      comentario,
      usuario,
    });

    console.log("🟩 [CONTROLLER] Comentário criado com sucesso", {
      comentarioCriado,
    });

    return res.status(201).json({
      message: "Comentário salvo com sucesso.",
      data: comentarioCriado,
    });
  } catch (error) {
    console.log("🟥 [CONTROLLER ERROR] criarComentario", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(400).json({
      message: error.message || "Erro ao salvar comentário.",
    });
  }
}

/**
 * GET /api/mrhs/:mrhId/comentarios
 * Lista comentários da MRH
 */
export async function listarComentarios(req, res) {
  console.log("🟦 [CONTROLLER] listarComentarios - INÍCIO", {
    params: req.params,
  });

  try {
    const { mrhId } = req.params;

    console.log("🟨 [CONTROLLER] Buscando comentários", {
      mrhIdNumber: Number(mrhId),
    });

    const comentarios = await listarComentariosMRH(Number(mrhId));

    console.log("🟩 [CONTROLLER] Comentários encontrados", {
      total: Array.isArray(comentarios) ? comentarios.length : 0,
    });

    return res.status(200).json(comentarios);
  } catch (error) {
    console.log("🟥 [CONTROLLER ERROR] listarComentarios", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(400).json({
      message: error.message || "Erro ao listar comentários.",
    });
  }
}
