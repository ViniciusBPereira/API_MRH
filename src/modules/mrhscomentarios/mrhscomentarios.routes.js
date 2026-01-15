import { Router } from "express";
import {
  criarComentario,
  listarComentarios,
} from "./mrhscomentarios.controller.js";

const router = Router();

/**
 * Comentários da MRH
 *
 * POST   /api/mrhs/:mrhId/comentarios  → cria comentário
 * GET    /api/mrhs/:mrhId/comentarios  → lista comentários
 */

router.post("/:mrhId/comentarios", criarComentario);

router.get("/:mrhId/comentarios", listarComentarios);

export default router;
