// api/modules/candidatosregistrados/candidatosregistrados.service.js

import repo from "./candidatosregistrados.repository.js";

const candidatosRegistradosService = {
  async listarTodos() {
    return await repo.listarTodos();
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
