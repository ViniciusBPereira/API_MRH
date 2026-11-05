
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

// Rotas específicas devem vir antes de /:id.

// GET /contracts
router.get("/", getContracts);

// GET /contracts/count
router.get("/count", countContracts);

// GET /contracts/bp/:businessPartner
router.get("/bp/:businessPartner", getContractsByBusinessPartner);

// GET /contracts/contract/:contract
router.get("/contract/:contract", getContractByContract);

// GET /contracts/:id
router.get("/:id", getContractById);

// POST /contracts
router.post("/", createContract);

// PUT /contracts/:id
router.put("/:id", updateContract);

// DELETE /contracts/:id
router.delete("/:id", deleteContract);

export default router;
