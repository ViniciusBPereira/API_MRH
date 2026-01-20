// ficha.routes.js
import { Router } from "express";
import * as controller from "./ficha.controller.js";

const router = Router();

/**
 * GET /fichas/:id
 * Retorna uma ficha pelo ID
 */
router.get("/:id", controller.getFicha);

/**
 * POST /fichas/candidato/:candidatoId
 * Cria ficha para um candidato
 */
router.post("/candidato/:candidatoId", controller.postFicha);

/**
 * PUT /fichas/:id
 * Atualiza ficha existente
 */
router.put("/:id", controller.putFicha);

export default router;
