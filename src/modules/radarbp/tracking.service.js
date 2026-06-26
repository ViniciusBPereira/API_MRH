import trackingRepository from "./tracking.repository.js";

class TrackingService {
  async getAll() {
    return await trackingRepository.findAll();
  }

  async getById(id) {
    const tracking = await trackingRepository.findById(id);

    if (!tracking) throw new Error("Acompanhamento não encontrado.");

    return tracking;
  }

  async getByContract(contract) {
    return await trackingRepository.findByContract(contract);
  }

  async create(data) {
    return await trackingRepository.create(data);
  }

  async update(id, data) {
    const tracking = await trackingRepository.findById(id);

    if (!tracking) throw new Error("Acompanhamento não encontrado.");

    return await trackingRepository.update(id, data);
  }

  async delete(id) {
    const tracking = await trackingRepository.findById(id);

    if (!tracking) throw new Error("Acompanhamento não encontrado.");

    await trackingRepository.delete(id);

    return {
      message: "Acompanhamento removido com sucesso.",
    };
  }
}

export default new TrackingService();
