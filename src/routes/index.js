import express from "express";

const router = express.Router(); // ✅ FALTAVA ISSO

/* ================= ROTAS ================= */
import authRoutes from "../modules/auth/auth.routes.js";
import mrhsAbertasRoutes from "../modules/mrhsabertas/mrhsabertas.routes.js";
import mrhsDocumentacaoRoutes from "../modules/mrhsdocumentacao/mrhsdocumentacao.routes.js";
import mrhsAgendamentoRoutes from "../modules/mrhsagendamento/mrhsAgendamento.routes.js";
import mrhsComentariosRoutes from "../modules/mrhscomentarios/mrhscomentarios.routes.js";
import candidatosRoutes from "../modules/candidatos/candidatos.routes.js";
import fichaRoutes from "../modules/fichas/ficha.routes.js";
import candidatosRegistradosRoutes from "../modules/candidatosregistrados/candidatosregistrados.routes.js";
import checkDocsRoutes from "../modules/checkdocs/checkdocs.routes.js";

/* ================= RADAR BP ================= */
import visitRoutes from "../modules/radarbp/visit.routes.js";
import trackingRoutes from "../modules/radarbp/tracking.routes.js";
import actionRoutes from "../modules/radarbp/action.routes.js";

/* ================= RONDAS CORP ================= */
import rondasRoutes from "../modules/rondasCorp/module/rondasCorpExport.routes.js";
import rondasLoginRoutes from "../modules/rondasCorp/login/rondasCorpLogin.routes.js";

/* ================= MIDDLEWARE ================= */
import { authMiddleware } from "../modules/middlewares/auth.middleware.js";
import { authRondasCorp } from "../modules/rondasCorp/login/authRondasCorp.middleware.js";

/* =======================================================
   🔓 ROTAS PÚBLICAS
======================================================= */

router.use("/auth", authRoutes);
router.use("/rondas", rondasLoginRoutes);

/* =======================================================
   🛡️ RONDAS CORP
======================================================= */
router.use("/rondas", authRondasCorp, rondasRoutes);

/* =======================================================
   🔒 RESTO PROTEGIDO
======================================================= */
router.use(authMiddleware);

router.use("/mrhsabertas", mrhsAbertasRoutes);
router.use("/mrhsdocumentacao", mrhsDocumentacaoRoutes);
router.use("/mrhsagendamento", mrhsAgendamentoRoutes);
router.use("/mrhs", mrhsComentariosRoutes);

router.use("/candidatos", candidatosRoutes);
router.use("/candidatosregistrados", candidatosRegistradosRoutes);
router.use("/fichas", fichaRoutes);
router.use("/checkdocs", checkDocsRoutes);

/* ================= RADAR BP ================= */

router.use("/visits", visitRoutes);
router.use("/tracking", trackingRoutes);
router.use("/actions", actionRoutes);

export default router;
