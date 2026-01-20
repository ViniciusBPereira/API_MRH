import { Router } from "express";

import {
  listarChecklistController,
  criarItemChecklistController,
  atualizarCheckChecklistController,
  atualizarItemChecklistController,
  removerItemChecklistController,
  resumoChecklistController,
} from "./checkdocs.controller.js";

const router = Router();

/* =======================================================
   🔥 ROTAS CHECKLIST DE DOCUMENTAÇÃO
   (ordem: específicas → genéricas)
   ======================================================= */

/* -------------------------------------------------------
   📊 RESUMO DA DOCUMENTAÇÃO (GRID)
   GET /checkdocs/resumo/:idCandidato
------------------------------------------------------- */
router.get("/resumo/:idCandidato", resumoChecklistController);

/* -------------------------------------------------------
   ☑️ ATUALIZAR SOMENTE O CHECK (checkbox)
   PATCH /checkdocs/item/:idItem/check
   body: { checked }
------------------------------------------------------- */
router.patch("/item/:idItem/check", atualizarCheckChecklistController);

/* -------------------------------------------------------
   ✏️ ATUALIZAR ITEM (nome / ordem)
   PUT /checkdocs/item/:idItem
   body: { nome?, ordem? }
------------------------------------------------------- */
router.put("/item/:idItem", atualizarItemChecklistController);

/* -------------------------------------------------------
   ❌ REMOVER ITEM
   DELETE /checkdocs/item/:idItem
------------------------------------------------------- */
router.delete("/item/:idItem", removerItemChecklistController);

/* -------------------------------------------------------
   📄 LISTAR CHECKLIST DO CANDIDATO (MODAL)
   GET /checkdocs/:idCandidato
------------------------------------------------------- */
router.get("/:idCandidato", listarChecklistController);

/* -------------------------------------------------------
   ➕ CRIAR ITEM DE CHECKLIST
   POST /checkdocs/:idCandidato
   body: { nome, ordem? }
------------------------------------------------------- */
router.post("/:idCandidato", criarItemChecklistController);

export default router;
