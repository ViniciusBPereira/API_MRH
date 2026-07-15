import { Router } from "express";
import multer from "multer";
import { uploadDocs } from "./candidatos.upload.js";

import {
  getCandidatos,
  postCandidato,
  putCandidato,
  putStatus,
  deleteCandidato,
  uploadDocumento,
  listarDocumentos,
  importarCSV,
  getFicha,
  deleteDocumento,
  putValidacaoIndividual,
  putMoverMrh,
} from "./candidatos.controller.js";

const router = Router();
const uploadCSV = multer();

/* =======================================================
   🔥 ROTAS ORGANIZADAS (ESPECÍFICAS → GENÉRICAS)
   =======================================================*/

/* -------------------------------------------------------
   📄 DOCUMENTOS DO CANDIDATO
------------------------------------------------------- */
router.get("/docs/:id", listarDocumentos);
router.delete("/docs/:id/:nome", deleteDocumento);
router.post("/upload/:id", uploadDocs.single("arquivo"), uploadDocumento);

/* -------------------------------------------------------
   📑 FICHA DO CANDIDATO
------------------------------------------------------- */
router.get("/ficha/:id", getFicha);

/* -------------------------------------------------------
   🔥 ATUALIZAR STATUS DO CANDIDATO
------------------------------------------------------- */
router.put("/status/:id", putStatus);

/* -------------------------------------------------------
   🔥 ATUALIZAR UMA ÚNICA VALIDAÇÃO
------------------------------------------------------- */
router.put("/validacao/:id", putValidacaoIndividual);

/* -------------------------------------------------------
   🚨 REMOVER CANDIDATO
------------------------------------------------------- */
router.delete("/:id", deleteCandidato);

/* -------------------------------------------------------
   📤 IMPORTAR CSV
------------------------------------------------------- */
router.post("/importar-csv/:mrhId", uploadCSV.single("arquivo"), importarCSV);

router.put("/mover-mrh/:id", putMoverMrh);

// CRUD
router.post("/:mrhId", postCandidato);
router.put("/edit/:id", putCandidato);

// GENÉRICA POR ÚLTIMO
router.get("/:mrhId", getCandidatos);

export default router;
