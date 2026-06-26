import { Router } from "express";

import {
  getActions,
  getActionById,
  getActionsByVisit,
  getActionsByContract,
  createAction,
  updateAction,
  deleteAction,
} from "./action.controller.js";

const router = Router();

/* =====================================================
   📄 AÇÕES
===================================================== */
router.get("/", getActions);

/* =====================================================
   🔍 BUSCAR AÇÃO
===================================================== */
router.get("/:id", getActionById);

/* =====================================================
   📄 BUSCAR POR VISITA
===================================================== */
router.get("/visit/:visitId", getActionsByVisit);

/* =====================================================
   📄 BUSCAR POR CONTRATO
===================================================== */
router.get("/contract/:contract", getActionsByContract);

/* =====================================================
   ➕ CRIAR AÇÃO
===================================================== */
router.post("/", createAction);

/* =====================================================
   ✏️ ATUALIZAR AÇÃO
===================================================== */
router.put("/:id", updateAction);

/* =====================================================
   🗑 REMOVER AÇÃO
===================================================== */
router.delete("/:id", deleteAction);

export default router;
