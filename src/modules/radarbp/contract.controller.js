
import contractService from "./contract.service.js";

/**
 * Respostas de erro consistentes para todas as rotas.
 * Não revela detalhes internos do PostgreSQL em erros inesperados.
 */
function respondError(res, error, fallback, operation) {
  console.error(`[CONTRACT CONTROLLER] ${operation}:`, error);

  if (error?.code === "23505") {
    return res.status(409).json({
      message: "Já existe um contrato cadastrado com esse número/nome.",
    });
  }

  if (error?.code === "23503") {
    return res.status(409).json({
      message: "Não foi possível concluir a operação porque há registros vinculados ao contrato.",
    });
  }

  if (error?.code === "22P02") {
    return res.status(400).json({
      message: "Identificador ou valor informado é inválido.",
    });
  }

  if (["23502", "23514", "22001", "22003"].includes(error?.code)) {
    return res.status(400).json({
      message: "Os dados enviados não atendem às regras do cadastro de contratos.",
    });
  }

  const status = Number(error?.statusCode);

  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({
      message: error.message || fallback,
    });
  }

  return res.status(500).json({
    message: fallback,
  });
}

/* =====================================================
   GET /contracts
===================================================== */

export async function getContracts(req, res) {
  try {
    return res.status(200).json(
      await contractService.getAll()
    );
  } catch (error) {
    return respondError(
      res,
      error,
      "Erro ao buscar contratos.",
      "getContracts"
    );
  }
}

/* =====================================================
   GET /contracts/:id
===================================================== */

export async function getContractById(req, res) {
  try {
    return res.status(200).json(
      await contractService.getById(req.params.id)
    );
  } catch (error) {
    return respondError(
      res,
      error,
      "Erro ao buscar contrato.",
      "getContractById"
    );
  }
}

/* =====================================================
   GET /contracts/contract/:contract
===================================================== */

export async function getContractByContract(req, res) {
  try {
    // Compatibilidade com o código original:
    // retorna um contrato ou null.
    return res.status(200).json(
      await contractService.getByContract(
        req.params.contract
      )
    );
  } catch (error) {
    return respondError(
      res,
      error,
      "Erro ao buscar contrato.",
      "getContractByContract"
    );
  }
}

/* =====================================================
   GET /contracts/bp/:businessPartner
===================================================== */

export async function getContractsByBusinessPartner(req, res) {
  try {
    return res.status(200).json(
      await contractService.getByBusinessPartner(
        req.params.businessPartner
      )
    );
  } catch (error) {
    return respondError(
      res,
      error,
      "Erro ao buscar contratos do Business Partner.",
      "getContractsByBusinessPartner"
    );
  }
}

/* =====================================================
   POST /contracts
===================================================== */

export async function createContract(req, res) {
  try {
    const created = await contractService.create(req.body);

    return res.status(201).json(created);
  } catch (error) {
    return respondError(
      res,
      error,
      "Erro ao criar contrato.",
      "createContract"
    );
  }
}

/* =====================================================
   PUT /contracts/:id
===================================================== */

export async function updateContract(req, res) {
  try {
    const updated = await contractService.update(
      req.params.id,
      req.body
    );

    return res.status(200).json(updated);
  } catch (error) {
    return respondError(
      res,
      error,
      "Erro ao atualizar contrato.",
      "updateContract"
    );
  }
}

/* =====================================================
   DELETE /contracts/:id
===================================================== */

export async function deleteContract(req, res) {
  try {
    const result = await contractService.delete(
      req.params.id
    );

    return res.status(200).json(result);
  } catch (error) {
    return respondError(
      res,
      error,
      "Erro ao remover contrato.",
      "deleteContract"
    );
  }
}

/* =====================================================
   GET /contracts/count
===================================================== */

export async function countContracts(req, res) {
  try {
    return res.status(200).json({
      total: await contractService.count(),
    });
  } catch (error) {
    return respondError(
      res,
      error,
      "Erro ao contabilizar contratos.",
      "countContracts"
    );
  }
}
