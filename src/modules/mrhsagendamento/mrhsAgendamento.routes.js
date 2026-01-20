import { Router } from "express";

import {
  getMRHsAgendamento,
  atualizarAgendamento,
  atualizarExame,
} from "./mrhsAgendamento.controller.js";

const router = Router();

/* =====================================================
   📄 MRHs — TIME DE AGENDAMENTO
   ✔ lista apenas etapa = 1
===================================================== */
router.get("/", getMRHsAgendamento);

/* =====================================================
   ✏️ AGENDAMENTO — AUTO SAVE
   Campos:
   - uniformes
   - data_integracao
   - data_admissao
===================================================== */
router.patch("/:mrh", atualizarAgendamento);

/* =====================================================
   ✏️ EXAME — AUTO SAVE
   (mantido por compatibilidade)
===================================================== */
router.patch("/exame/:mrh", atualizarExame);

export default router;
