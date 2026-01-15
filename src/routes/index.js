import express from "express";

/* ================= ROTAS ================= */
import authRoutes from "../modules/auth/auth.routes.js";
import mrhsAbertasRoutes from "../modules/mrhsabertas/mrhsabertas.routes.js";
import mrhsDocumentacaoRoutes from "../modules/mrhsdocumentacao/mrhsdocumentacao.routes.js";
import mrhsAgendamentoRoutes from "../modules/mrhsagendamento/mrhsAgendamento.routes.js"; // ✅ NOVO
import mrhsComentariosRoutes from "../modules/mrhscomentarios/mrhscomentarios.routes.js";
import candidatosRoutes from "../modules/candidatos/candidatos.routes.js";
import fichaRoutes from "../modules/fichas/ficha.routes.js";
import candidatosRegistradosRoutes from "../modules/candidatosregistrados/candidatosregistrados.routes.js";
import checkDocsRoutes from "../modules/checkdocs/checkdocs.routes.js";

/* ================= MIDDLEWARE ================= */
import { authMiddleware } from "../modules/middlewares/auth.middleware.js";

const router = express.Router();

/* =======================================================
   🔓 ROTAS PÚBLICAS
======================================================= */
router.use("/auth", authRoutes);

/* =======================================================
   🔒 A PARTIR DAQUI TODAS AS ROTAS SÃO PROTEGIDAS
======================================================= */
router.use(authMiddleware);

/* =======================================================
   🔐 ROTAS PRIVADAS
======================================================= */

/* ================= MRHs =================
   /api/mrhsabertas
     → lista MRHs abertas

   /api/mrhsdocumentacao
     → etapa = 0
     → documentação / checklist / uploads / exame
     → concluir MRH (etapa = 1)

   /api/mrhsagendamento
     → etapa = 1
     → agendamento / uniformes / datas / exame

   /api/mrhs/:id/comentarios
     → comentários vinculados à MRH
========================================= */
router.use("/mrhsabertas", mrhsAbertasRoutes);
router.use("/mrhsdocumentacao", mrhsDocumentacaoRoutes);
router.use("/mrhsagendamento", mrhsAgendamentoRoutes); // ✅ NOVO
router.use("/mrhs", mrhsComentariosRoutes); // comentários dependem desse prefixo

/* ================= CANDIDATOS ================= */
router.use("/candidatos", candidatosRoutes);
router.use("/candidatosregistrados", candidatosRegistradosRoutes);

/* ================= FICHAS ================= */
router.use("/fichas", fichaRoutes);

/* ================= CHECKLIST / DOCUMENTAÇÃO =================
   /api/checkdocs
     → checklist por id_candidato
     → atualizar check
     → remover / editar itens
=========================================================== */
router.use("/checkdocs", checkDocsRoutes);

export default router;
