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
  try {
    const { mrhId } = req.params;
    const { comentario } = req.body;
    const usuario = req.user;

    const comentarioCriado = await criarComentarioMRH({
      mrhId: Number(mrhId),
      comentario,
      usuario,
    });

    return res.status(201).json({
      message: "Comentário salvo com sucesso.",
      data: comentarioCriado,
    });
  } catch (error) {
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
  try {
    const { mrhId } = req.params;

    const comentarios = await listarComentariosMRH(Number(mrhId));

    return res.status(200).json(comentarios);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Erro ao listar comentários.",
    });
  }
}
