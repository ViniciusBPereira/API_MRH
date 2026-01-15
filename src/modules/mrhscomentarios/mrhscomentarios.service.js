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
  console.log("🟨 [SERVICE] criarComentarioMRH - INÍCIO", {
    mrhId,
    tipoMrhId: typeof mrhId,
    comentario,
    comentarioLength: comentario?.length,
    usuarioId: usuario?.id,
  });

  if (!mrhId || isNaN(mrhId)) {
    console.log("❌ [SERVICE] MRH inválida", mrhId);
    throw new Error("MRH inválida.");
  }

  if (!comentario || !comentario.trim()) {
    console.log("❌ [SERVICE] Comentário vazio", comentario);
    throw new Error("Comentário não pode ser vazio.");
  }

  if (!usuario?.id) {
    console.log("❌ [SERVICE] Usuário não autenticado", usuario);
    throw new Error("Usuário não autenticado.");
  }

  console.log("🟩 [SERVICE] Dados validados, chamando repository.create", {
    mrhId,
    usuarioId: usuario.id,
    comentario: comentario.trim(),
  });

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
  console.log("🟨 [SERVICE] listarComentariosMRH - INÍCIO", {
    mrhId,
    tipoMrhId: typeof mrhId,
  });

  if (!mrhId || isNaN(mrhId)) {
    console.log("❌ [SERVICE] MRH inválida (listar)", mrhId);
    throw new Error("MRH inválida.");
  }

  console.log("🟩 [SERVICE] Buscando comentários no repository", { mrhId });

  return repository.getByMrh(mrhId);
}
