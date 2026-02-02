import { Router } from "express";

import {
  listar,
  exportarCsv,
  ultimaSincronizacao,
} from "./rondasCorpExport.controller.js";

const router = Router();

/* =====================================================
   📄 RONDAS CORP — LISTAGEM
   GET /api/rondas

   Query params opcionais:
   - limit
   - offset
   - dataInicio (YYYY-MM-DD ou ISO)
   - dataFim (YYYY-MM-DD ou ISO)
   - roteiro (string | contém / LIKE)
===================================================== */
router.get("/", listar);

/* =====================================================
   ⏱️ RONDAS CORP — ÚLTIMA SINCRONIZAÇÃO
   GET /api/rondas/ultima-sincronizacao
   (não depende de CR, data ou roteiro)
===================================================== */
router.get("/ultima-sincronizacao", ultimaSincronizacao);

/* =====================================================
   📥 RONDAS CORP — EXPORTAÇÃO CSV
   GET /api/rondas/export/csv

   Query params opcionais:
   - dataInicio
   - dataFim
   - roteiro (string | contém / LIKE)
===================================================== */
router.get("/export/csv", exportarCsv);

export default router;
