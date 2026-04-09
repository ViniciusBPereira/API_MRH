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
import npsRoutes from "../modules/nps/nps.routes.js";

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

/* 🔥 NPS SEM AUTH */
router.use("/nps", npsRoutes);

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

export default router;