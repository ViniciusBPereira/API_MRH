import { Router } from "express";

import {
  getContracts,
  getContractById,
  getContractByContract,
  getContractsByBusinessPartner,
  createContract,
  updateContract,
  deleteContract,
  countContracts,
} from "./contract.controller.js";

const router = Router();

// ============================================================
// 📄 LISTAR CONTRATOS
// GET /contracts
// ============================================================

router.get("/", getContracts);

// ============================================================
// 📊 CONTAR CONTRATOS
// GET /contracts/count
// ============================================================

router.get("/count", countContracts);

// ============================================================
// 🔍 BUSCAR POR BUSINESS PARTNER
// GET /contracts/bp/:businessPartner
//
// Um BP pode retornar vários contratos.
// ============================================================

router.get("/bp/:businessPartner", getContractsByBusinessPartner);

// ============================================================
// 🔍 BUSCAR POR CONTRATO
// GET /contracts/contract/:contract
// ============================================================

router.get("/contract/:contract", getContractByContract);

// ============================================================
// 🔍 BUSCAR POR ID
// GET /contracts/:id
// ============================================================

router.get("/:id", getContractById);

// ============================================================
// ➕ CRIAR CONTRATO
// POST /contracts
// ============================================================

router.post("/", createContract);

// ============================================================
// ✏️ ATUALIZAR CONTRATO
// PUT /contracts/:id
// ============================================================

router.put("/:id", updateContract);

// ============================================================
// 🗑 EXCLUIR CONTRATO
// DELETE /contracts/:id
// ============================================================

router.delete("/:id", deleteContract);

export default router;
