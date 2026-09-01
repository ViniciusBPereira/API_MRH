import { Router } from "express";

import {
  getVisits,
  getVisitById,
  getVisitsByContract,
  createVisit,
  updateVisit,
  deleteVisit,
} from "./visit.controller.js";

const router = Router();

// ============================================================
// LISTAR TODAS
// ============================================================

router.get("/", getVisits);

// ============================================================
// BUSCAR POR CONTRATO
// ============================================================

router.get("/contract/:contractId", getVisitsByContract);

// ============================================================
// BUSCAR POR ID
// ============================================================

router.get("/:id", getVisitById);

// ============================================================
// CRIAR
// ============================================================

router.post("/", createVisit);

// ============================================================
// ATUALIZAR
// ============================================================

router.put("/:id", updateVisit);

// ============================================================
// EXCLUIR
// ============================================================

router.delete("/:id", deleteVisit);

export default router;
