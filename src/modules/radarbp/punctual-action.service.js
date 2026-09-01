import punctualActionRepository from "./punctual-action.repository.js";

class PunctualActionService {
  // ============================================================
  // LISTAR TODAS
  // ============================================================

  async getAll() {
    return await punctualActionRepository.findAll();
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async getById(id) {
    const action = await punctualActionRepository.findById(id);

    if (!action) {
      throw new Error("Ação pontual não encontrada.");
    }

    return action;
  }

  // ============================================================
  // BUSCAR POR CONTRATO
  // ============================================================

  async getByContract(contractId) {
    return await punctualActionRepository.findByContract(contractId);
  }

  // ============================================================
  // CRIAR
  // ============================================================

  async create(data) {
    return await punctualActionRepository.create({
      ...data,

      status: data.status ?? "A fazer",

      files: data.files || [],
    });
  }

  // ============================================================
  // ATUALIZAR
  // ============================================================

  async update(id, data) {
    const action = await punctualActionRepository.findById(id);

    if (!action) {
      throw new Error("Ação pontual não encontrada.");
    }

    return await punctualActionRepository.update(id, {
      ...data,

      status: data.status ?? action.status ?? "A fazer",

      files: data.files !== undefined ? data.files : action.files || [],
    });
  }

  // ============================================================
  // DELETAR
  // ============================================================

  async delete(id) {
    const action = await punctualActionRepository.findById(id);

    if (!action) {
      throw new Error("Ação pontual não encontrada.");
    }

    await punctualActionRepository.delete(id);

    return {
      message: "Ação pontual removida com sucesso.",
    };
  }

  // ============================================================
  // ARQUIVOS
  // ============================================================

  async getFiles(actionId) {
    const action = await punctualActionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação pontual não encontrada.");
    }

    return await punctualActionRepository.getFiles(actionId);
  }

  // ============================================================
  // BUSCAR ARQUIVO
  // ============================================================

  async getFile(actionId, fileId) {
    const action = await punctualActionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação pontual não encontrada.");
    }

    const file = await punctualActionRepository.getFile(actionId, fileId);

    if (!file) {
      throw new Error("Arquivo não encontrado.");
    }

    return file;
  }

  // ============================================================
  // ADICIONAR ARQUIVO
  // ============================================================

  async addFile(actionId, file) {
    const action = await punctualActionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação pontual não encontrada.");
    }

    return await punctualActionRepository.addFile(actionId, file);
  }

  // ============================================================
  // REMOVER ARQUIVO
  // ============================================================

  async removeFile(actionId, fileId) {
    const action = await punctualActionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação pontual não encontrada.");
    }

    const file = await punctualActionRepository.getFile(actionId, fileId);

    if (!file) {
      throw new Error("Arquivo não encontrado.");
    }

    await punctualActionRepository.removeFile(actionId, fileId);

    return file;
  }

  // ============================================================
  // SUBSTITUIR ARQUIVOS
  // ============================================================

  async replaceFiles(actionId, files) {
    const action = await punctualActionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação pontual não encontrada.");
    }

    return await punctualActionRepository.replaceFiles(actionId, files);
  }
}

export default new PunctualActionService();
