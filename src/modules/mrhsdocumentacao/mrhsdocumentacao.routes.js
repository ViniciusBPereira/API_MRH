import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  getMRHsDocumentacao,
  getItensDocumentacaoPorCpf,
  criarItemDocumentacaoPorCpf,
  uploadDocumentoPorCpf,
  listarUploadsDocumentoPorCpf,
  atualizarExame,
  concluirEtapa, // ✅ NOVO
} from "./mrhsdocumentacao.controller.js";

const router = Router();

/* =====================================================
   📦 CONFIGURAÇÃO DO MULTER (LOCAL)
===================================================== */
const uploadPath = path.resolve("uploads/candidatos");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = file.originalname
      .replace(ext, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    cb(null, `${Date.now()}_${baseName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

/* =====================================================
   📄 MRHs — TIME DE DOCUMENTAÇÃO
===================================================== */
router.get("/", getMRHsDocumentacao);

/* =====================================================
   📎 CHECKLIST — ITENS POR CPF
===================================================== */
router.get("/itens/:cpf", getItensDocumentacaoPorCpf);
router.post("/itens/:cpf", criarItemDocumentacaoPorCpf);

/* =====================================================
   📂 LISTAR UPLOADS (candidatos.docs)
===================================================== */
router.get("/upload/:cpf", listarUploadsDocumentoPorCpf);

/* =====================================================
   📤 UPLOAD DE DOCUMENTO (candidatos.docs)
===================================================== */
router.post("/upload/:cpf", upload.single("arquivo"), uploadDocumentoPorCpf);

/* =====================================================
   ✏️ EXAME — AUTO SAVE
===================================================== */
router.patch("/exame/:mrh", atualizarExame);

/* =====================================================
   ✅ CONCLUIR DOCUMENTAÇÃO (etapa = 1)
===================================================== */
router.patch("/concluir/:mrh", concluirEtapa);

export default router;
