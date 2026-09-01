import contractRepository from "./contract.repository.js";

class ContractService {
  // ============================================================
  // LISTAR CONTRATOS
  // ============================================================

  async getAll() {
    return await contractRepository.findAll();
  }

  // ============================================================
  // BUSCAR CONTRATO POR ID
  // ============================================================

  async getById(id) {
    if (!id) {
      throw new Error("ID do contrato é obrigatório.");
    }

    const contract = await contractRepository.findById(id);

    if (!contract) {
      throw new Error("Contrato não encontrado.");
    }

    return contract;
  }

  // ============================================================
  // BUSCAR POR CONTRATO
  // ============================================================

  async getByContract(contract) {
    if (!contract || !String(contract).trim()) {
      throw new Error("Contrato é obrigatório.");
    }

    return await contractRepository.findByContract(String(contract).trim());
  }

  // ============================================================
  // BUSCAR POR BUSINESS PARTNER
  //
  // IMPORTANTE:
  // Um BP pode possuir vários contratos.
  // ============================================================

  async getByBusinessPartner(businessPartner) {
    if (!businessPartner || !String(businessPartner).trim()) {
      throw new Error("Business Partner é obrigatório.");
    }

    return await contractRepository.findByBusinessPartner(
      String(businessPartner).trim(),
    );
  }

  // ============================================================
  // CRIAR CONTRATO
  // ============================================================

  async create(data) {
    if (!data) {
      throw new Error("Dados do contrato são obrigatórios.");
    }

    // ----------------------------------------------------------
    // CAMPOS OBRIGATÓRIOS
    // ----------------------------------------------------------

    if (!data.contract || !String(data.contract).trim()) {
      throw new Error("Contrato é obrigatório.");
    }

    if (!data.business_partner || !String(data.business_partner).trim()) {
      throw new Error("Business Partner é obrigatório.");
    }

    // ----------------------------------------------------------
    // NORMALIZAÇÃO
    // ----------------------------------------------------------

    const contract = String(data.contract).trim();

    const businessPartner = String(data.business_partner).trim();

    // ----------------------------------------------------------
    // VERIFICAR CONTRATO DUPLICADO
    //
    // O contrato é único.
    // ----------------------------------------------------------

    const contractExists = await contractRepository.existsByContract(contract);

    if (contractExists) {
      throw new Error("Já existe um contrato cadastrado com esse nome.");
    }

    // ----------------------------------------------------------
    // CRIAR CONTRATO
    // ----------------------------------------------------------

    return await contractRepository.create({
      contract,

      client:
        data.client !== undefined && data.client !== ""
          ? String(data.client).trim()
          : null,

      unit:
        data.unit !== undefined && data.unit !== ""
          ? String(data.unit).trim()
          : null,

      business_partner: businessPartner,

      leadership_responsible:
        data.leadership_responsible !== undefined &&
        data.leadership_responsible !== ""
          ? String(data.leadership_responsible).trim()
          : null,

      headcount:
        data.headcount !== undefined && data.headcount !== ""
          ? data.headcount
          : null,
    });
  }

  // ============================================================
  // ATUALIZAR CONTRATO
  // ============================================================

  async update(id, data) {
    if (!id) {
      throw new Error("ID do contrato é obrigatório.");
    }

    if (!data) {
      throw new Error("Dados do contrato são obrigatórios.");
    }

    // ----------------------------------------------------------
    // VERIFICAR EXISTÊNCIA
    // ----------------------------------------------------------

    const current = await contractRepository.findById(id);

    if (!current) {
      throw new Error("Contrato não encontrado.");
    }

    // ----------------------------------------------------------
    // CAMPOS OBRIGATÓRIOS
    // ----------------------------------------------------------

    if (!data.contract || !String(data.contract).trim()) {
      throw new Error("Contrato é obrigatório.");
    }

    if (!data.business_partner || !String(data.business_partner).trim()) {
      throw new Error("Business Partner é obrigatório.");
    }

    // ----------------------------------------------------------
    // NORMALIZAÇÃO
    // ----------------------------------------------------------

    const contract = String(data.contract).trim();

    const businessPartner = String(data.business_partner).trim();

    // ----------------------------------------------------------
    // VERIFICAR CONTRATO DUPLICADO
    //
    // Ignora o próprio registro através do ID.
    // ----------------------------------------------------------

    const contractExists = await contractRepository.existsByContract(
      contract,
      id,
    );

    if (contractExists) {
      throw new Error("Já existe outro contrato cadastrado com esse nome.");
    }

    // ----------------------------------------------------------
    // ATUALIZAR
    // ----------------------------------------------------------

    const updated = await contractRepository.update(id, {
      contract,

      client:
        data.client !== undefined && data.client !== ""
          ? String(data.client).trim()
          : null,

      unit:
        data.unit !== undefined && data.unit !== ""
          ? String(data.unit).trim()
          : null,

      business_partner: businessPartner,

      leadership_responsible:
        data.leadership_responsible !== undefined &&
        data.leadership_responsible !== ""
          ? String(data.leadership_responsible).trim()
          : null,

      headcount:
        data.headcount !== undefined && data.headcount !== ""
          ? data.headcount
          : null,
    });

    if (!updated) {
      throw new Error("Não foi possível atualizar o contrato.");
    }

    return updated;
  }

  // ============================================================
  // EXCLUIR CONTRATO
  // ============================================================

  async delete(id) {
    if (!id) {
      throw new Error("ID do contrato é obrigatório.");
    }

    // ----------------------------------------------------------
    // VERIFICAR EXISTÊNCIA
    // ----------------------------------------------------------

    const current = await contractRepository.findById(id);

    if (!current) {
      throw new Error("Contrato não encontrado.");
    }

    // ----------------------------------------------------------
    // EXCLUIR
    // ----------------------------------------------------------

    await contractRepository.delete(id);

    return {
      message: "Contrato removido com sucesso.",
    };
  }

  // ============================================================
  // CONTAR CONTRATOS
  // ============================================================

  async count() {
    return await contractRepository.count();
  }
}

export default new ContractService();
