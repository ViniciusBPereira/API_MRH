import repository from "./mrhscomentarios.repository.js";

/**
 * Service responsável pelas regras de negócio
 * relacionadas aos comentários das MRHs
 *
 * Responsabilidades:
 * - Validar dados de entrada
 * - Orquestrar chamadas ao repository
 * - Garantir consistência das regras de negócio
 */

/**
 * Cria um novo comentário para uma MRH
 *
 * @param {Object} params
 * @param {number} params.mrhId - ID da MRH
 * @param {string} params.comentario - Texto do comentário
 * @param {Object} params.usuario - Usuário autenticado
 *
 * @returns {Promise<Object>} Comentário criado
 */
export async function criarComentarioMRH({ mrhId, comentario, usuario }) {
  if (!mrhId || isNaN(mrhId)) {
    throw new Error("MRH inválida.");
  }

  if (!comentario || !comentario.trim()) {
    throw new Error("Comentário não pode ser vazio.");
  }

  if (!usuario?.id) {
    throw new Error("Usuário não autenticado.");
  }

  return repository.create({
    mrhId,
    comentario: comentario.trim(),
    usuarioId: usuario.id,
  });
}

/**
 * Lista todos os comentários de uma MRH
 *
 * @param {number} mrhId - ID da MRH
 *
 * @returns {Promise<Array>} Lista de comentários
 */
export async function listarComentariosMRH(mrhId) {
  if (!mrhId || isNaN(mrhId)) {
    throw new Error("MRH inválida.");
  }

  return repository.getByMrh(mrhId);
}
