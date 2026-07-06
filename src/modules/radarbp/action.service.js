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

  async getByContract(contract) {
    return await actionRepository.findByContract(contract);
  }

  async create(data) {
    return await actionRepository.create({
      ...data,
      visit_id: data.visit_id || null,
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
}

export default new ActionService();
