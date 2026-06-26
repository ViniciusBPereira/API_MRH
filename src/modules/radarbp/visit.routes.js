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

/* =====================================================
   📄 VISITAS
===================================================== */
router.get("/", getVisits);

/* =====================================================
   🔍 BUSCAR VISITA
===================================================== */
router.get("/:id", getVisitById);

/* =====================================================
   📄 BUSCAR POR CONTRATO
===================================================== */
router.get("/contract/:contract", getVisitsByContract);

/* =====================================================
   ➕ CRIAR VISITA
===================================================== */
router.post("/", createVisit);

/* =====================================================
   ✏️ ATUALIZAR VISITA
===================================================== */
router.put("/:id", updateVisit);

/* =====================================================
   🗑 REMOVER VISITA
===================================================== */
router.delete("/:id", deleteVisit);

export default router;
