import { Router } from "express";

import {
  getTracking,
  getTrackingById,
  getTrackingByContract,
  createTracking,
  updateTracking,
  deleteTracking,
} from "./tracking.controller.js";

const router = Router();

/* =====================================================
   📄 ACOMPANHAMENTOS
===================================================== */
router.get("/", getTracking);

/* =====================================================
   🔍 BUSCAR ACOMPANHAMENTO
===================================================== */
router.get("/:id", getTrackingById);

/* =====================================================
   📄 BUSCAR POR CONTRATO
===================================================== */
router.get("/contract/:contract", getTrackingByContract);

/* =====================================================
   ➕ CRIAR ACOMPANHAMENTO
===================================================== */
router.post("/", createTracking);

/* =====================================================
   ✏️ ATUALIZAR ACOMPANHAMENTO
===================================================== */
router.put("/:id", updateTracking);

/* =====================================================
   🗑 REMOVER ACOMPANHAMENTO
===================================================== */
router.delete("/:id", deleteTracking);

export default router;
