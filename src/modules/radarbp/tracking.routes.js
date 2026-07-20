import { Router } from "express";

import {
  getTracking,
  getTrackingById,
  getTrackingEdit,
  getTrackingByContract,
  createTracking,
  updateTracking,
  updateTrackingEdit,
  deleteTracking,
} from "./tracking.controller.js";

const router = Router();

/* =====================================================
   📄 LISTAR ACOMPANHAMENTOS
===================================================== */
router.get("/", getTracking);

/* =====================================================
   📄 BUSCAR ACOMPANHAMENTOS POR CR
===================================================== */
router.get("/cr/:cr", getTrackingByContract);

/* =====================================================
   ✏️ BUSCAR DADOS PARA EDIÇÃO
   Retorna Tracking + Visita vinculada
===================================================== */
router.get("/:id/edit", getTrackingEdit);

/* =====================================================
   🔍 BUSCAR ACOMPANHAMENTO POR ID
===================================================== */
router.get("/:id", getTrackingById);

/* =====================================================
   ➕ CRIAR ACOMPANHAMENTO
===================================================== */
router.post("/", createTracking);

/* =====================================================
   ✏️ ATUALIZAR SOMENTE TRACKING
===================================================== */
router.put("/:id", updateTracking);

/* =====================================================
   ✏️ ATUALIZAR TRACKING + VISITA
===================================================== */
router.put("/:id/edit", updateTrackingEdit);

/* =====================================================
   🗑 REMOVER ACOMPANHAMENTO
===================================================== */
router.delete("/:id", deleteTracking);

export default router;
