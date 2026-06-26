import visitRepository from "./visit.repository.js";
import diagnosisService from "./diagnosis.service.js";

class VisitService {
  async getAll() {
    return await visitRepository.findAll();
  }

  async getById(id) {
    const visit = await visitRepository.findById(id);

    if (!visit) {
      throw new Error("Visita não encontrada.");
    }

    return visit;
  }

  async getByContract(contract) {
    return await visitRepository.findByContract(contract);
  }

  async create(data) {
    const diagnosis = diagnosisService.calculate(data);

    const visitData = {
      ...data,
      ...diagnosis,
    };

    return await visitRepository.create(visitData);
  }

  async update(id, data) {
    const visit = await visitRepository.findById(id);

    if (!visit) {
      throw new Error("Visita não encontrada.");
    }

    const diagnosis = diagnosisService.calculate(data);

    const visitData = {
      ...data,
      ...diagnosis,
    };

    return await visitRepository.update(id, visitData);
  }

  async delete(id) {
    const visit = await visitRepository.findById(id);

    if (!visit) {
      throw new Error("Visita não encontrada.");
    }

    await visitRepository.delete(id);

    return {
      message: "Visita removida com sucesso.",
    };
  }
}

export default new VisitService();
