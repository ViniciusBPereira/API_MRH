import visitRepository from "./visit.repository.js";
import diagnosisService from "./diagnosis.service.js";

class VisitService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll() {
    return await visitRepository.findAll();
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async getById(id) {
    if (!id) {
      throw new Error("ID da visita é obrigatório.");
    }

    const visit = await visitRepository.findById(id);

    if (!visit) {
      throw new Error("Visita não encontrada.");
    }

    return visit;
  }

  // ============================================================
  // BUSCAR POR CONTRATO
  // ============================================================

  async getByContract(contractId) {
    if (!contractId) {
      throw new Error("Contrato é obrigatório.");
    }

    return await visitRepository.findByContract(contractId);
  }

  // ============================================================
  // NORMALIZAR NÚMERO
  // ============================================================

  normalizeNumber(value) {
    if (value === undefined || value === null || value === "") {
      return 0;
    }

    const normalized = String(value).trim().replace(",", ".");

    const number = Number(normalized);

    if (!Number.isFinite(number)) {
      throw new Error(`Valor numérico inválido: ${value}`);
    }

    return number;
  }

  // ============================================================
  // NORMALIZAR INTEIRO
  // ============================================================

  normalizeInteger(value) {
    if (value === undefined || value === null || value === "") {
      return 0;
    }

    const normalized = Number(value);

    if (!Number.isFinite(normalized)) {
      throw new Error(`Valor inteiro inválido: ${value}`);
    }

    return Math.round(normalized);
  }

  // ============================================================
  // NORMALIZAR CAUSAS RAIZ
  // ============================================================

  normalizeRootCause(value) {
    if (!value) {
      return [];
    }

    // Caso venha como array
    if (Array.isArray(value)) {
      return value
        .filter(
          (item) =>
            item !== undefined && item !== null && String(item).trim() !== "",
        )
        .map((item) => String(item).trim());
    }

    // Caso venha como string
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return [];
      }

      return [trimmed];
    }

    return [];
  }

  // ============================================================
  // NORMALIZAR DATA
  // ============================================================

  normalizeDate(value) {
    if (!value) {
      throw new Error("Data da visita é obrigatória.");
    }

    const date = String(value).trim();

    // Esperamos YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Data da visita inválida. Utilize o formato YYYY-MM-DD.");
    }

    return date;
  }

  // ============================================================
  // NORMALIZAR DADOS
  // ============================================================

  normalizeData(data) {
    return {
      // ----------------------------------------------------------
      // IDENTIFICAÇÃO
      // ----------------------------------------------------------

      contract_id: data.contract_id,

      visit_date: this.normalizeDate(data.visit_date),

      // ----------------------------------------------------------
      // INDICADORES
      // ----------------------------------------------------------

      employees_approached: this.normalizeInteger(data.employees_approached),

      turnover: this.normalizeNumber(data.turnover),

      absenteeism: this.normalizeNumber(data.absenteeism),

      he_inefficiency: this.normalizeNumber(data.he_inefficiency),

      open_positions: this.normalizeInteger(data.open_positions),

      replacement_days: this.normalizeNumber(data.replacement_days),

      labor_actions: this.normalizeInteger(data.labor_actions),

      warnings: this.normalizeInteger(data.warnings),

      enps: this.normalizeNumber(data.enps),

      // ----------------------------------------------------------
      // ANÁLISE QUALITATIVA
      // ----------------------------------------------------------

      root_cause: this.normalizeRootCause(data.root_cause),

      evidence:
        data.evidence !== undefined && data.evidence !== null
          ? String(data.evidence).trim()
          : "",

      overview:
        data.overview !== undefined && data.overview !== null
          ? String(data.overview).trim()
          : "",

      // ----------------------------------------------------------
      // PILARES
      // ----------------------------------------------------------

      leadership_score: this.normalizeNumber(data.leadership_score),

      climate_score: this.normalizeNumber(data.climate_score),

      structure_score: this.normalizeNumber(data.structure_score),

      customer_score: this.normalizeNumber(data.customer_score),
    };
  }

  // ============================================================
  // VALIDAR DADOS BÁSICOS
  // ============================================================

  validateData(data) {
    if (!data) {
      throw new Error("Dados da visita são obrigatórios.");
    }

    if (!data.contract_id) {
      throw new Error("Contrato é obrigatório.");
    }

    if (!data.visit_date) {
      throw new Error("Data da visita é obrigatória.");
    }
  }

  // ============================================================
  // VALIDAR JSON
  // ============================================================

  validateJson(value, fieldName) {
    try {
      JSON.stringify(value);
    } catch (error) {
      throw new Error(`O campo ${fieldName} contém dados inválidos para JSON.`);
    }
  }

  // ============================================================
  // MONTAR DIAGNÓSTICO
  // ============================================================

  buildDiagnosis(data) {
    const diagnosis = diagnosisService.calculate(data);

    if (!diagnosis || typeof diagnosis !== "object") {
      throw new Error("Não foi possível gerar o diagnóstico da visita.");
    }

    this.validateJson(diagnosis, "diagnosis");

    return {
      ...data,

      indicator_score: this.normalizeNumber(diagnosis.indicator_score),

      pillar_score: this.normalizeNumber(diagnosis.pillar_score),

      final_score: this.normalizeNumber(diagnosis.final_score),

      classification:
        diagnosis.classification !== undefined &&
        diagnosis.classification !== null
          ? String(diagnosis.classification)
          : "",

      priority:
        diagnosis.priority !== undefined && diagnosis.priority !== null
          ? String(diagnosis.priority)
          : "",

      executive_opinion:
        diagnosis.executive_opinion !== undefined &&
        diagnosis.executive_opinion !== null
          ? String(diagnosis.executive_opinion)
          : "",

      diagnosis,
    };
  }

  // ============================================================
  // CRIAR
  // ============================================================

  async create(data) {
    this.validateData(data);

    // ----------------------------------------------------------
    // VERIFICAR CONTRATO
    // ----------------------------------------------------------

    const contractExists = await visitRepository.contractExists(
      data.contract_id,
    );

    if (!contractExists) {
      throw new Error("Contrato não encontrado.");
    }

    // ----------------------------------------------------------
    // NORMALIZAR PRIMEIRO
    // ----------------------------------------------------------

    const visitData = this.normalizeData(data);

    // ----------------------------------------------------------
    // VERIFICAR DUPLICIDADE
    // ----------------------------------------------------------

    const visitExists = await visitRepository.existsByContractAndDate(
      visitData.contract_id,
      visitData.visit_date,
    );

    if (visitExists) {
      throw new Error(
        "Já existe uma visita cadastrada para esse contrato nessa data.",
      );
    }

    // ----------------------------------------------------------
    // CALCULAR DIAGNÓSTICO
    // ----------------------------------------------------------

    const finalData = this.buildDiagnosis(visitData);

    // ----------------------------------------------------------
    // PERSISTIR
    // ----------------------------------------------------------

    return await visitRepository.create(finalData);
  }

  // ============================================================
  // ATUALIZAR
  // ============================================================

  async update(id, data) {
    if (!id) {
      throw new Error("ID da visita é obrigatório.");
    }

    // ----------------------------------------------------------
    // VERIFICAR VISITA
    // ----------------------------------------------------------

    const current = await visitRepository.findById(id);

    if (!current) {
      throw new Error("Visita não encontrada.");
    }

    // ----------------------------------------------------------
    // VALIDAR
    // ----------------------------------------------------------

    this.validateData(data);

    // ----------------------------------------------------------
    // VERIFICAR CONTRATO
    // ----------------------------------------------------------

    const contractExists = await visitRepository.contractExists(
      data.contract_id,
    );

    if (!contractExists) {
      throw new Error("Contrato não encontrado.");
    }

    // ----------------------------------------------------------
    // NORMALIZAR
    // ----------------------------------------------------------

    const visitData = this.normalizeData(data);

    // ----------------------------------------------------------
    // VERIFICAR DUPLICIDADE
    // ----------------------------------------------------------

    const visitExists = await visitRepository.existsByContractAndDate(
      visitData.contract_id,
      visitData.visit_date,
      id,
    );

    if (visitExists) {
      throw new Error(
        "Já existe outra visita cadastrada para esse contrato nessa data.",
      );
    }

    // ----------------------------------------------------------
    // RECALCULAR DIAGNÓSTICO
    // ----------------------------------------------------------

    const finalData = this.buildDiagnosis(visitData);

    // ----------------------------------------------------------
    // ATUALIZAR
    // ----------------------------------------------------------

    const updated = await visitRepository.update(id, finalData);

    if (!updated) {
      throw new Error("Não foi possível atualizar a visita.");
    }

    return updated;
  }

  // ============================================================
  // EXCLUIR
  // ============================================================

  async delete(id) {
    if (!id) {
      throw new Error("ID da visita é obrigatório.");
    }

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
