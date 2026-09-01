import actionRepository from "./action.repository.js";

class ActionService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll() {
    return await actionRepository.findAll();
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async getById(id) {
    if (!id) {
      throw new Error("ID da ação é obrigatório.");
    }

    const action = await actionRepository.findById(id);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return action;
  }

  // ============================================================
  // BUSCAR POR CONTRATO
  // ============================================================

  async getByContract(contractId) {
    if (!contractId) {
      throw new Error("Contrato é obrigatório.");
    }

    return await actionRepository.findByContract(contractId);
  }

  // ============================================================
  // CRIAR
  // ============================================================

  async create(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Dados da ação são obrigatórios.");
    }

    const contractId = data.contract_id;
    const description = data.description;

    if (!contractId) {
      throw new Error("Contrato é obrigatório.");
    }

    if (!description || !String(description).trim()) {
      throw new Error("Descrição da ação é obrigatória.");
    }

    const actionData = {
      contract_id: contractId,
      description: String(description).trim(),

      execution_plan:
        data.execution_plan !== undefined &&
        data.execution_plan !== null
          ? String(data.execution_plan)
          : null,

      indicators:
        data.indicators !== undefined &&
        data.indicators !== null
          ? String(data.indicators)
          : null,

      responsible:
        data.responsible !== undefined &&
        data.responsible !== null
          ? String(data.responsible)
          : null,

      due_date:
        data.due_date !== undefined &&
        data.due_date !== ""
          ? data.due_date
          : null,

      status:
        data.status !== undefined &&
        data.status !== ""
          ? data.status
          : "A fazer",

      files: Array.isArray(data.files)
        ? data.files
        : [],
    };

    return await actionRepository.create(actionData);
  }

  // ============================================================
  // ATUALIZAR
  // ============================================================

  async update(id, data) {
    if (!id) {
      throw new Error("ID da ação é obrigatório.");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Dados da ação são obrigatórios.");
    }

    const current = await actionRepository.findById(id);

    if (!current) {
      throw new Error("Ação não encontrada.");
    }

    const contractId =
      data.contract_id !== undefined
        ? data.contract_id
        : current.contract_id;

    const description =
      data.description !== undefined
        ? data.description
        : current.description;

    if (!contractId) {
      throw new Error("Contrato é obrigatório.");
    }

    if (!description || !String(description).trim()) {
      throw new Error("Descrição da ação é obrigatória.");
    }

    const actionData = {
      contract_id: contractId,

      description: String(description).trim(),

      execution_plan:
        data.execution_plan !== undefined
          ? data.execution_plan
          : current.execution_plan,

      indicators:
        data.indicators !== undefined
          ? data.indicators
          : current.indicators,

      responsible:
        data.responsible !== undefined
          ? data.responsible
          : current.responsible,

      due_date:
        data.due_date !== undefined
          ? data.due_date || null
          : current.due_date,

      status:
        data.status !== undefined
          ? data.status
          : current.status,

      files:
        data.files !== undefined
          ? data.files
          : current.files || [],
    };

    return await actionRepository.update(
      id,
      actionData
    );
  }

  // ============================================================
  // EXCLUIR
  // ============================================================

  async delete(id) {
    if (!id) {
      throw new Error("ID da ação é obrigatório.");
    }

    const action = await actionRepository.findById(id);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    await actionRepository.delete(id);

    return {
      message: "Ação removida com sucesso.",
    };
  }

  // ============================================================
  // ARQUIVOS
  // ============================================================

  async getFiles(actionId) {
    if (!actionId) {
      throw new Error("ID da ação é obrigatório.");
    }

    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return await actionRepository.getFiles(actionId);
  }

  // ============================================================
  // BUSCAR ARQUIVO
  // ============================================================

  async getFile(actionId, fileId) {
    if (!actionId) {
      throw new Error("ID da ação é obrigatório.");
    }

    if (!fileId) {
      throw new Error("ID do arquivo é obrigatório.");
    }

    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    const file = await actionRepository.getFile(
      actionId,
      fileId
    );

    if (!file) {
      throw new Error("Arquivo não encontrado.");
    }

    return file;
  }

  // ============================================================
  // ADICIONAR ARQUIVO
  // ============================================================

  async addFile(actionId, file) {
    if (!actionId) {
      throw new Error("ID da ação é obrigatório.");
    }

    if (!file) {
      throw new Error("Arquivo é obrigatório.");
    }

    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return await actionRepository.addFile(
      actionId,
      file
    );
  }

  // ============================================================
  // REMOVER ARQUIVO
  // ============================================================

  async removeFile(actionId, fileId) {
    if (!actionId) {
      throw new Error("ID da ação é obrigatório.");
    }

    if (!fileId) {
      throw new Error("ID do arquivo é obrigatório.");
    }

    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    const file = await actionRepository.getFile(
      actionId,
      fileId
    );

    if (!file) {
      throw new Error("Arquivo não encontrado.");
    }

    await actionRepository.removeFile(
      actionId,
      fileId
    );

    return file;
  }

  // ============================================================
  // SUBSTITUIR ARQUIVOS
  // ============================================================

  async replaceFiles(actionId, files) {
    if (!actionId) {
      throw new Error("ID da ação é obrigatório.");
    }

    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new Error("Ação não encontrada.");
    }

    return await actionRepository.replaceFiles(
      actionId,
      files
    );
  }
}

export default new ActionService();