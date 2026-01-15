import { Router } from "express";
import * as controller from "./mrhsabertas.controller.js";

const router = Router();

/**
 * GET /
 * Lista todas as MRHs abertas
 * Retorna MRHs com:
 * - total de candidatos
 * - total de comentários
 */
router.get("/", controller.getMRHsAbertas);

export default router;
