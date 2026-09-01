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
    const action = await actionRepository.findById(id);

    ```
if (!action) {
  throw new Error("Ação não encontrada.");
}

return action;
```;
  }

  // ============================================================
  // BUSCAR POR CONTRATO
  // ============================================================

  async getByContract(contractId) {
    if (!contractId) {
      throw new Error("Contrato é obrigatório.");
    }

    ```
return await actionRepository.findByContract(contractId);
```;
  }

  // ============================================================
  // CRIAR
  // ============================================================

  async create(data) {
    if (!data) {
      throw new Error("Dados da ação são obrigatórios.");
    }

    ```
if (!data.contract_id) {
  throw new Error("Contrato é obrigatório.");
}

if (!data.description) {
  throw new Error("Descrição da ação é obrigatória.");
}

return await actionRepository.create({
  ...data,
  contract_id: data.contract_id,
  execution_plan: data.execution_plan ?? null,
  responsible: data.responsible ?? null,
  due_date: data.due_date ?? null,
  status: data.status ?? "A fazer",
  files: data.files || [],
});
```;
  }

  // ============================================================
  // ATUALIZAR
  // ============================================================

  async update(id, data) {
    const action = await actionRepository.findById(id);

    ```
if (!action) {
  throw new Error("Ação não encontrada.");
}

if (!data.contract_id) {
  throw new Error("Contrato é obrigatório.");
}

if (!data.description) {
  throw new Error("Descrição da ação é obrigatória.");
}

return await actionRepository.update(id, {
  ...data,
  contract_id: data.contract_id,
  execution_plan: data.execution_plan ?? null,
  responsible: data.responsible ?? null,
  due_date: data.due_date ?? null,
  status: data.status ?? action.status ?? "A fazer",
  files:
    data.files !== undefined
      ? data.files
      : action.files || [],
});
```;
  }

  // ============================================================
  // EXCLUIR
  // ============================================================

  async delete(id) {
    const action = await actionRepository.findById(id);

    ```
if (!action) {
  throw new Error("Ação não encontrada.");
}

await actionRepository.delete(id);

return {
  message: "Ação removida com sucesso.",
};
```;
  }

  // ============================================================
  // ARQUIVOS
  // ============================================================

  async getFiles(actionId) {
    const action = await actionRepository.findById(actionId);

    ```
if (!action) {
  throw new Error("Ação não encontrada.");
}

return await actionRepository.getFiles(actionId);
```;
  }

  // ============================================================
  // BUSCAR ARQUIVO
  // ============================================================

  async getFile(actionId, fileId) {
    const action = await actionRepository.findById(actionId);

    ```
if (!action) {
  throw new Error("Ação não encontrada.");
}

const file = await actionRepository.getFile(
  actionId,
  fileId,
);

if (!file) {
  throw new Error("Arquivo não encontrado.");
}

return file;
```;
  }

  // ============================================================
  // ADICIONAR ARQUIVO
  // ============================================================

  async addFile(actionId, file) {
    const action = await actionRepository.findById(actionId);

    ```
if (!action) {
  throw new Error("Ação não encontrada.");
}

return await actionRepository.addFile(actionId, file);
```;
  }

  // ============================================================
  // REMOVER ARQUIVO
  // ============================================================

  async removeFile(actionId, fileId) {
    const action = await actionRepository.findById(actionId);

    ```
if (!action) {
  throw new Error("Ação não encontrada.");
}

const file = await actionRepository.getFile(
  actionId,
  fileId,
);

if (!file) {
  throw new Error("Arquivo não encontrado.");
}

await actionRepository.removeFile(actionId, fileId);

return file;
```;
  }

  // ============================================================
  // SUBSTITUIR ARQUIVOS
  // ============================================================

  async replaceFiles(actionId, files) {
    const action = await actionRepository.findById(actionId);

    ```
if (!action) {
  throw new Error("Ação não encontrada.");
}

return await actionRepository.replaceFiles(
  actionId,
  files,
);
```;
  }
}

export default new ActionService();
