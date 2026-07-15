import actionRepository from "./action.repository.js";

class ActionService {
  async getAll() {
    return await actionRepository.findAll();
  }

  async getById(id) {
    const action = await actionRepository.findById(id);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return action;
  }

  async getByVisit(visitId) {
    return await actionRepository.findByVisit(visitId);
  }

  async getByContract(cr) {
    return await actionRepository.findByContract(cr);
  }

  async create(data) {
    return await actionRepository.create({
      ...data,
      visit_id: data.visit_id || null,
      files: data.files || [],
    });
  }

  async update(id, data) {
    const action = await actionRepository.findById(id);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return await actionRepository.update(id, {
      ...data,
      visit_id: data.visit_id || null,
      files:
        data.files !== undefined
          ? data.files
          : action.files || [],
    });
  }

  async delete(id) {
    const action = await actionRepository.findById(id);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    await actionRepository.delete(id);

    return {
      message: "Ação removida com sucesso.",
    };
  }

  // ==========================
  // Arquivos
  // ==========================

  async getFiles(actionId) {
    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return await actionRepository.getFiles(actionId);
  }

  async getFile(actionId, fileId) {
    const file = await actionRepository.getFile(actionId, fileId);

    if (!file) {
      throw new Error("Arquivo não encontrado.");
    }

    return file;
  }

  async addFile(actionId, file) {
    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return await actionRepository.addFile(actionId, file);
  }

  async removeFile(actionId, fileId) {
    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    const file = await actionRepository.getFile(actionId, fileId);

    if (!file) {
      throw new Error("Arquivo não encontrado.");
    }

    await actionRepository.removeFile(actionId, fileId);

    return file;
  }

  async replaceFiles(actionId, files) {
    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return await actionRepository.replaceFiles(actionId, files);
  }
}

export default new ActionService();