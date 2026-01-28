import { Router } from "express";

import {
  listar,
  exportarCsv,
  ultimaSincronizacao,
} from "./rondasCorpExport.controller.js";

const router = Router();

/* =====================================================
   📄 RONDAS CORP — LISTAGEM
   GET /rondas
===================================================== */
router.get("/", listar);

/* =====================================================
   📥 RONDAS CORP — EXPORTAÇÃO CSV
   GET /rondas/export/csv
===================================================== */
router.get("/export/csv", exportarCsv);

/* =====================================================
   ⏱️ RONDAS CORP — ÚLTIMA SINCRONIZAÇÃO
   GET /rondas/ultima-sincronizacao
===================================================== */
router.get("/ultima-sincronizacao", ultimaSincronizacao);

export default router;
