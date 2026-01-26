// api/modules/candidatosregistrados/candidatosregistrados.service.js

import repo from "./candidatosregistrados.repository.js";

const candidatosRegistradosService = {
  async listarTodos() {
    // Já retorna mrh_id e desistente via repository
    return await repo.listarTodos();
  },

  async atualizarDesistente(id, desistente) {
    if (!id) {
      throw new Error("ID do candidato é obrigatório.");
    }

    if (typeof desistente !== "boolean") {
      throw new Error("Valor de desistente inválido.");
    }

    const atualizado = await repo.atualizarDesistente(id, desistente);

    if (!atualizado) {
      throw new Error("Candidato não encontrado.");
    }

    return atualizado;
  },

  async excluir(id) {
    if (!id) {
      throw new Error("ID é obrigatório.");
    }

    const removido = await repo.excluir(id);

    if (!removido) {
      throw new Error("Candidato não encontrado.");
    }

    return removido;
  },
};

export default candidatosRegistradosService;
