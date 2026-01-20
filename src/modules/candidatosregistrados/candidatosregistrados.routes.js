// api/modules/candidatosregistrados/candidatosregistrados.routes.js

import { Router } from "express";
import controller from "./candidatosregistrados.controller.js";

const router = Router();

// 🔍 Listar todos os candidatos cadastrados
router.get("/", controller.listar);

// 🗑️ Excluir candidato pelo ID
router.delete("/:id", controller.excluir);

export default router;
