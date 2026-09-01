import trackingRepository from "./tracking.repository.js";

// ============================================================
// NORMALIZAR MÊS DE REFERÊNCIA
// ============================================================
//
// O frontend usa:
// <input type="month">
//
// Portanto recebe:
// YYYY-MM
//
// Como o PostgreSQL está usando DATE, transformamos para:
// YYYY-MM-01
//
// Também aceitamos YYYY-MM-DD.
// ============================================================

const normalizeReferenceMonth = (value) => {
  if (!value) {
    return null;
  }

  const stringValue = String(value).trim();

  // ------------------------------------------------------------
  // YYYY-MM-DD
  // ------------------------------------------------------------

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  // ------------------------------------------------------------
  // YYYY-MM
  // ------------------------------------------------------------

  if (/^\d{4}-\d{2}$/.test(stringValue)) {
    return `${stringValue}-01`;
  }

  throw new Error("Mês de referência inválido. Use o formato YYYY-MM.");
};

class TrackingService {
  // ============================================================
  // LISTAR TODOS
  // ============================================================

  async getAll() {
    return await trackingRepository.findAll();
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async getById(id) {
    if (!id) {
      throw new Error("ID do acompanhamento é obrigatório.");
    }

    const tracking = await trackingRepository.findById(id);

    if (!tracking) {
      throw new Error("Acompanhamento não encontrado.");
    }

    return tracking;
  }

  // ============================================================
  // BUSCAR POR CONTRATO
  // ============================================================

  async getByContract(contractId) {
    if (!contractId) {
      throw new Error("Contrato é obrigatório.");
    }

    return await trackingRepository.findByContract(contractId);
  }

  // ============================================================
  // DADOS PARA EDIÇÃO
  // ============================================================

  async getEditData(id) {
    if (!id) {
      throw new Error("ID do acompanhamento é obrigatório.");
    }

    const data = await trackingRepository.findEditData(id);

    if (!data) {
      throw new Error("Não foi possível encontrar os dados do acompanhamento.");
    }

    return data;
  }

  // ============================================================
  // CRIAR
  // ============================================================

  async create(data) {
    if (!data) {
      throw new Error("Dados do acompanhamento são obrigatórios.");
    }

    if (!data.contract_id) {
      throw new Error("Contrato é obrigatório.");
    }

    if (!data.reference_month) {
      throw new Error("Mês de referência é obrigatório.");
    }

    // ----------------------------------------------------------
    // NORMALIZA O MÊS
    // ----------------------------------------------------------

    const normalizedData = {
      ...data,

      reference_month: normalizeReferenceMonth(data.reference_month),
    };

    return await trackingRepository.create(normalizedData);
  }

  // ============================================================
  // ATUALIZAR
  // ============================================================

  async update(id, data) {
    if (!id) {
      throw new Error("ID do acompanhamento é obrigatório.");
    }

    if (!data) {
      throw new Error("Dados do acompanhamento são obrigatórios.");
    }

    const tracking = await trackingRepository.findById(id);

    if (!tracking) {
      throw new Error("Acompanhamento não encontrado.");
    }

    if (!data.contract_id) {
      throw new Error("Contrato é obrigatório.");
    }

    if (!data.reference_month) {
      throw new Error("Mês de referência é obrigatório.");
    }

    // ----------------------------------------------------------
    // NORMALIZA O MÊS
    // ----------------------------------------------------------

    const normalizedData = {
      ...data,

      reference_month: normalizeReferenceMonth(data.reference_month),
    };

    return await trackingRepository.update(id, normalizedData);
  }

  // ============================================================
  // ATUALIZAR TRACKING + VISITA
  // ============================================================

  async updateEdit(id, data) {
    if (!id) {
      throw new Error("ID do acompanhamento é obrigatório.");
    }

    if (!data) {
      throw new Error("Dados do acompanhamento são obrigatórios.");
    }

    const tracking = await trackingRepository.findById(id);

    if (!tracking) {
      throw new Error("Acompanhamento não encontrado.");
    }

    if (!data.contract_id) {
      throw new Error("Contrato é obrigatório.");
    }

    if (!data.visit_date) {
      throw new Error("Data da visita é obrigatória.");
    }

    // ----------------------------------------------------------
    // NORMALIZA O MÊS
    // ----------------------------------------------------------

    const normalizedData = {
      ...data,

      reference_month: data.reference_month
        ? normalizeReferenceMonth(data.reference_month)
        : tracking.reference_month,
    };

    return await trackingRepository.updateEdit(id, normalizedData);
  }

  // ============================================================
  // EXCLUIR
  // ============================================================

  async delete(id) {
    if (!id) {
      throw new Error("ID do acompanhamento é obrigatório.");
    }

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
