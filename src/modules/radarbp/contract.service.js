
import contractRepository from "./contract.repository.js";

const DEFAULT_STATUS = "Em acompanhamento";

const VALID_STATUSES = [
  DEFAULT_STATUS,
  "Standby",
  "Encerrado",
];

const MAX_STATUS_OBSERVATION = 500;

/* =====================================================
   TRATAMENTO DE ERROS
===================================================== */

function httpError(message, statusCode = 400) {
  return Object.assign(new Error(message), {
    statusCode,
  });
}

/* =====================================================
   CAMPOS OBRIGATÓRIOS
===================================================== */

function requiredText(value, name) {
  const result =
    value === undefined || value === null
      ? ""
      : String(value).trim();

  if (!result) {
    throw httpError(`${name} é obrigatório.`);
  }

  return result;
}

/* =====================================================
   CAMPOS OPCIONAIS
===================================================== */

function optionalText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const result = String(value).trim();

  return result || null;
}

/* =====================================================
   EFETIVO
===================================================== */

function normalizeHeadcount(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 0 ||
    number > 2147483647
  ) {
    throw httpError(
      "Efetivo deve ser um número inteiro entre 0 e 2.147.483.647."
    );
  }

  return number;
}

/* =====================================================
   STATUS DO CONTRATO
===================================================== */

function normalizeMonitoringStatus(value) {
  const result = String(
    value ?? DEFAULT_STATUS
  ).trim();

  const found = VALID_STATUSES.find(
    (item) =>
      item.toLocaleLowerCase("pt-BR") ===
      result.toLocaleLowerCase("pt-BR")
  );

  if (!found) {
    throw httpError(
      `Status inválido. Utilize: ${VALID_STATUSES.join(", ")}.`
    );
  }

  return found;
}

/* =====================================================
   OBSERVAÇÃO DO STATUS
===================================================== */

function normalizeObservation(value) {
  const result =
    value === null || value === undefined
      ? ""
      : String(value).trim();

  if (result.length > MAX_STATUS_OBSERVATION) {
    throw httpError(
      `A observação deve ter no máximo ${MAX_STATUS_OBSERVATION} caracteres.`
    );
  }

  return result;
}

/* =====================================================
   PREPARAR DADOS DO CONTRATO

   POST:
   - Status sempre começa em "Em acompanhamento".

   PUT:
   - Permite editar status e observação.
   - Preserva campos não enviados.
===================================================== */

function prepareContractData(data, current = null) {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw httpError(
      "Dados do contrato são obrigatórios."
    );
  }

  const create = current === null;

  return {
    contract: requiredText(
      data.contract ?? current?.contract,
      "Contrato"
    ),

    business_partner: requiredText(
      data.business_partner ??
        current?.business_partner,
      "Business Partner"
    ),

    client: optionalText(
      data.client === undefined
        ? current?.client
        : data.client
    ),

    unit: optionalText(
      data.unit === undefined
        ? current?.unit
        : data.unit
    ),

    leadership_responsible: optionalText(
      data.leadership_responsible === undefined
        ? current?.leadership_responsible
        : data.leadership_responsible
    ),

    headcount: normalizeHeadcount(
      data.headcount === undefined
        ? current?.headcount
        : data.headcount
    ),

    monitoring_status: create
      ? DEFAULT_STATUS
      : normalizeMonitoringStatus(
          data.monitoring_status === undefined
            ? current.monitoring_status
            : data.monitoring_status
        ),

    status_observation: normalizeObservation(
      data.status_observation === undefined
        ? current?.status_observation
        : data.status_observation
    ),
  };
}

/* =====================================================
   SERVICE
===================================================== */

class ContractService {
  // ==================================================
  // LISTAR CONTRATOS
  // ==================================================

  async getAll() {
    return contractRepository.findAll();
  }

  // ==================================================
  // BUSCAR POR ID
  // ==================================================

  async getById(id) {
    const key = requiredText(
      id,
      "ID do contrato"
    );

    const contract =
      await contractRepository.findById(key);

    if (!contract) {
      throw httpError(
        "Contrato não encontrado.",
        404
      );
    }

    return contract;
  }

  // ==================================================
  // BUSCAR PELO CR
  // ==================================================

  async getByContract(contract) {
    return contractRepository.findByContract(
      requiredText(contract, "Contrato")
    );
  }

  // ==================================================
  // BUSCAR PELO BUSINESS PARTNER
  // ==================================================

  async getByBusinessPartner(businessPartner) {
    return contractRepository.findByBusinessPartner(
      requiredText(
        businessPartner,
        "Business Partner"
      )
    );
  }

  // ==================================================
  // CRIAR CONTRATO
  // ==================================================

  async create(data) {
    const payload = prepareContractData(data);

    // Mantém a regra atual: CR único.
    if (
      await contractRepository.existsByContract(
        payload.contract
      )
    ) {
      throw httpError(
        "Já existe um contrato cadastrado com esse número/nome.",
        409
      );
    }

    return contractRepository.create(payload);
  }

  // ==================================================
  // ATUALIZAR CONTRATO
  // ==================================================

  async update(id, data) {
    const key = requiredText(
      id,
      "ID do contrato"
    );

    const current =
      await contractRepository.findById(key);

    if (!current) {
      throw httpError(
        "Contrato não encontrado.",
        404
      );
    }

    const payload = prepareContractData(
      data,
      current
    );

    // Não permite duplicar o CR de outro contrato.
    if (
      await contractRepository.existsByContract(
        payload.contract,
        key
      )
    ) {
      throw httpError(
        "Já existe outro contrato cadastrado com esse número/nome.",
        409
      );
    }

    const updated =
      await contractRepository.update(
        key,
        payload
      );

    if (!updated) {
      throw httpError(
        "Contrato não encontrado.",
        404
      );
    }

    return updated;
  }

  // ==================================================
  // EXCLUIR CONTRATO
  // ==================================================

  async delete(id) {
    const key = requiredText(
      id,
      "ID do contrato"
    );

    const removed =
      await contractRepository.delete(key);

    if (!removed) {
      throw httpError(
        "Contrato não encontrado.",
        404
      );
    }

    return {
      message: "Contrato removido com sucesso.",
    };
  }

  // ==================================================
  // CONTAR CONTRATOS
  // ==================================================

  async count() {
    return contractRepository.count();
  }
}

export default new ContractService();
