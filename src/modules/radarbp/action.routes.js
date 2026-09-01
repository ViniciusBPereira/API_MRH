import { Router } from "express";

import { uploadActionPlans } from "./action.upload.js";

import {
  getActionPlans,
  getActionPlanById,
  getActionPlansByContract,
  createActionPlan,
  updateActionPlan,
  deleteActionPlan,
  getFiles,
  uploadFiles,
  downloadFile,
  deleteFile,
} from "./action.controller.js";

const router = Router();

/* =====================================================
   📄 PLANOS DE AÇÃO
===================================================== */

// Listar todos os planos de ação
router.get("/", getActionPlans);

// Buscar planos de ação por contrato
router.get("/contract/:contractId", getActionPlansByContract);

// Buscar plano de ação por ID
router.get("/:id", getActionPlanById);

/* =====================================================
   📂 ARQUIVOS
===================================================== */

// Listar arquivos do plano de ação
router.get("/:id/files", getFiles);

// Adicionar arquivos ao plano de ação
router.post("/:id/files", uploadActionPlans.array("files"), uploadFiles);

// Baixar arquivo
router.get("/:id/files/:fileId", downloadFile);

// Remover arquivo
router.delete("/:id/files/:fileId", deleteFile);

/* =====================================================
   ➕ CRUD
===================================================== */

// Criar plano de ação
router.post("/", uploadActionPlans.array("files"), createActionPlan);

// Atualizar plano de ação
router.put("/:id", uploadActionPlans.array("files"), updateActionPlan);

// Excluir plano de ação
router.delete("/:id", deleteActionPlan);

export default router;
