import contractService from "./contract.service.js";

/* =====================================================
   📄 GET /contracts
   Lista todos os contratos
===================================================== */

export async function getContracts(req, res) {
  try {
    const contracts = await contractService.getAll();

    return res.status(200).json(contracts);
  } catch (error) {
    console.error("[CONTROLLER] getContracts - erro:", error);

    return res.status(500).json({
      message: "Erro ao buscar contratos.",
    });
  }
}

/* =====================================================
   🔍 GET /contracts/:id
   Busca contrato por ID
===================================================== */

export async function getContractById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID do contrato é obrigatório.",
      });
    }

    const contract = await contractService.getById(id);

    return res.status(200).json(contract);
  } catch (error) {
    console.error("[CONTROLLER] getContractById - erro:", error);

    return res.status(404).json({
      message: error.message || "Contrato não encontrado.",
    });
  }
}

/* =====================================================
   🔍 GET /contracts/contract/:contract
   Busca contrato pelo nome/código do contrato
===================================================== */

export async function getContractByContract(req, res) {
  try {
    const { contract } = req.params;

    if (!contract) {
      return res.status(400).json({
        message: "Contrato é obrigatório.",
      });
    }

    const contracts = await contractService.getByContract(contract);

    return res.status(200).json(contracts);
  } catch (error) {
    console.error("[CONTROLLER] getContractByContract - erro:", error);

    return res.status(500).json({
      message: "Erro ao buscar contrato.",
    });
  }
}

/* =====================================================
   🔍 GET /contracts/bp/:businessPartner
   Busca contratos de um Business Partner

   IMPORTANTE:
   Um BP pode possuir vários contratos.
===================================================== */

export async function getContractsByBusinessPartner(req, res) {
  try {
    const { businessPartner } = req.params;

    if (!businessPartner) {
      return res.status(400).json({
        message: "Business Partner é obrigatório.",
      });
    }

    const contracts =
      await contractService.getByBusinessPartner(businessPartner);

    return res.status(200).json(contracts);
  } catch (error) {
    console.error("[CONTROLLER] getContractsByBusinessPartner - erro:", error);

    return res.status(500).json({
      message: "Erro ao buscar contratos do Business Partner.",
    });
  }
}

/* =====================================================
   ➕ POST /contracts
   Cria um novo contrato
===================================================== */

export async function createContract(req, res) {
  try {
    const created = await contractService.create(req.body);

    return res.status(201).json(created);
  } catch (error) {
    console.error("[CONTROLLER] createContract - erro:", error);

    return res.status(400).json({
      message: error.message || "Erro ao criar contrato.",
    });
  }
}

/* =====================================================
   ✏️ PUT /contracts/:id
   Atualiza um contrato
===================================================== */

export async function updateContract(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID do contrato é obrigatório.",
      });
    }

    const updated = await contractService.update(id, req.body);

    return res.status(200).json(updated);
  } catch (error) {
    console.error("[CONTROLLER] updateContract - erro:", error);

    return res.status(400).json({
      message: error.message || "Erro ao atualizar contrato.",
    });
  }
}

/* =====================================================
   🗑 DELETE /contracts/:id
   Remove um contrato
===================================================== */

export async function deleteContract(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID do contrato é obrigatório.",
      });
    }

    const result = await contractService.delete(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("[CONTROLLER] deleteContract - erro:", error);

    return res.status(404).json({
      message: error.message || "Erro ao remover contrato.",
    });
  }
}

/* =====================================================
   📊 GET /contracts/count
   Quantidade total de contratos
===================================================== */

export async function countContracts(req, res) {
  try {
    const total = await contractService.count();

    return res.status(200).json({
      total,
    });
  } catch (error) {
    console.error("[CONTROLLER] countContracts - erro:", error);

    return res.status(500).json({
      message: "Erro ao contabilizar contratos.",
    });
  }
}
