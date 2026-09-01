import { Router } from "express";

import { uploadPunctualActions } from "./punctual-action.upload.js";

import {
  getPunctualActions,
  getPunctualActionById,
  getPunctualActionsByContract,
  createPunctualAction,
  updatePunctualAction,
  deletePunctualAction,
  getFiles,
  uploadFiles,
  downloadFile,
  deleteFile,
} from "./punctual-action.controller.js";

const router = Router();

/* =====================================================
   AÇÕES PONTUAIS
===================================================== */

router.get("/", getPunctualActions);

router.get("/contract/:contractId", getPunctualActionsByContract);

/* =====================================================
   ARQUIVOS
===================================================== */

router.get("/:id/files", getFiles);

router.post("/:id/files", uploadPunctualActions.array("files"), uploadFiles);

router.get("/:id/files/:fileId", downloadFile);

router.delete("/:id/files/:fileId", deleteFile);

/* =====================================================
   CRUD
===================================================== */

router.get("/:id", getPunctualActionById);

router.post("/", uploadPunctualActions.array("files"), createPunctualAction);

router.put("/:id", uploadPunctualActions.array("files"), updatePunctualAction);

router.delete("/:id", deletePunctualAction);

export default router;
