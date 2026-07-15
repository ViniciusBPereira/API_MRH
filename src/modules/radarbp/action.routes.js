import { Router } from "express";
import { uploadActions } from "./action.upload.js";

import {
  getActions,
  getActionById,
  getActionsByVisit,
  getActionsByContract,
  createAction,
  updateAction,
  deleteAction,
  getFiles,
  uploadFiles,
  downloadFile,
  deleteFile,
} from "./action.controller.js";

const router = Router();

/* =====================================================
   AÇÕES
===================================================== */

router.get("/", getActions);

router.get("/visit/:visitId", getActionsByVisit);

router.get("/contract/:contract", getActionsByContract);

/* =====================================================
   ARQUIVOS
===================================================== */

router.get("/:id/files", getFiles);

router.post(
  "/:id/files",
  uploadActions.array("files"),
  uploadFiles
);

router.get(
  "/:id/files/:fileId",
  downloadFile
);

router.delete(
  "/:id/files/:fileId",
  deleteFile
);

/* =====================================================
   CRUD
===================================================== */

router.get("/:id", getActionById);

router.post(
  "/",
  uploadActions.array("files"),
  createAction
);

router.put(
  "/:id",
  uploadActions.array("files"),
  updateAction
);

router.delete("/:id", deleteAction);

export default router;