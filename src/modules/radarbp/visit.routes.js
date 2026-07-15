import { Router } from "express";

import {
  getVisits,
  getVisitById,
  getVisitsByPec,
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
   📄 BUSCAR POR PEC
===================================================== */
router.get("/pec/:pec", getVisitsByPec);

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