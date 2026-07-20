import trackingRepository from "./tracking.repository.js";

class TrackingService {

  async getAll() {
    return await trackingRepository.findAll();
  }


  async getById(id) {
    const tracking = await trackingRepository.findById(id);

    if (!tracking) {
      throw new Error("Acompanhamento não encontrado.");
    }

    return tracking;
  }


  async getByContract(cr) {
    return await trackingRepository.findByContract(cr);
  }


  /**
   * Retorna dados do acompanhamento + visita vinculada
   * Usado ao clicar no botão editar acompanhamento.
   */
  async getEditData(id) {
    const data = await trackingRepository.findEditData(id);

    if (!data) {
      throw new Error(
        "Não foi possível encontrar os dados do acompanhamento."
      );
    }

    return data;
  }


  async create(data) {
    return await trackingRepository.create(data);
  }


  async update(id, data) {
    const tracking = await trackingRepository.findById(id);

    if (!tracking) {
      throw new Error("Acompanhamento não encontrado.");
    }

    return await trackingRepository.update(id, data);
  }


  /**
   * Atualiza acompanhamento e visita vinculada.
   * 
   * Fluxo:
   * 1 - Usuário clica editar no Tracking
   * 2 - Busca Tracking + Visita
   * 3 - Usuário altera na tela de visitas
   * 4 - Salva atualizando as duas tabelas
   */
  async updateEdit(id, data) {
    const tracking = await trackingRepository.findById(id);

    if (!tracking) {
      throw new Error("Acompanhamento não encontrado.");
    }

    return await trackingRepository.updateEdit(id, data);
  }


  async delete(id) {
    const tracking = await trackingRepository.findById(id);

    if (!tracking) {
      throw new Error("Acompanhamento não encontrado.");
    }

    await trackingRepository.delete(id);

    return {
      message: "Acompanhamento removido com sucesso.",
    };
  }
}

export default new TrackingService();
