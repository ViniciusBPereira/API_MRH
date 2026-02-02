import { Router } from "express";
import { login, registrar } from "./rondasCorpLogin.controller.js";

const router = Router();

/**
 * =========================================
 * 🔐 LOGIN — RONDAS CORP
 * =========================================
 */

/**
 * POST /api/rondas/login
 * Login da aplicação Rondas Corp
 */
router.post("/login", login);

/**
 * POST /api/rondas/login/registrar
 * Registro de usuário da aplicação Rondas Corp
 */
router.post("/login/registrar", registrar);

export default router;
