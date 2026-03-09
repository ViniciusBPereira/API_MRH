import { Router } from "express";

import {
  getMRHsAgendamento,
  atualizarAgendamento,
  atualizarExame,
  concluirAgendamentosController,
} from "./mrhsAgendamento.controller.js";

const router = Router();

/* =====================================================
   📄 MRHs — TIME DE AGENDAMENTO
   ✔ lista apenas etapa = 1
===================================================== */
router.get("/", getMRHsAgendamento);

/* =====================================================
   ✅ CONCLUIR AGENDAMENTOS
   Botão do topo da tela
===================================================== */
router.patch("/concluir", concluirAgendamentosController);

/* =====================================================
   ✏️ EXAME — AUTO SAVE
===================================================== */
router.patch("/exame/:mrh", atualizarExame);

/* =====================================================
   ✏️ AGENDAMENTO — AUTO SAVE
   Campos:
   - uniformes
   - data_integracao
   - data_admissao
   - observacao
   - manter
===================================================== */
router.patch("/:mrh", atualizarAgendamento);

export default router;
