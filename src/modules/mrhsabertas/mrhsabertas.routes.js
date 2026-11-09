import { Router } from "express";
import * as controller from "./mrhsabertas.controller.js";

const router = Router();

/**
 * GET /
 * Lista todas as MRHs abertas (time = SELECAO)
 * Retorna MRHs com:
 * - total de candidatos
 * - total de comentários
 */
router.get("/", controller.getMRHsAbertas);

/**
 * PATCH /:id/documentacao
 * Move a MRH do time SELECAO para DOCUMENTACAO
 */
router.patch("/:id/documentacao", controller.moverMRH);
// Nova rota pública de melhorias
export const melhoriasPublicRoutes = Router();

melhoriasPublicRoutes.post(
  "/",
  controller.salvarMelhoria
);
export default router;
