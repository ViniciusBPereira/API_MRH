
import express from "express";

const router = express.Router();

/* =======================================================
   IMPORTAÇÕES — AUTENTICAÇÃO
======================================================= */

import authRoutes from "../modules/auth/auth.routes.js";

/* =======================================================
   IMPORTAÇÕES — MRHS
======================================================= */

import mrhsAbertasRoutes from "../modules/mrhsabertas/mrhsabertas.routes.js";

import {
  salvarMelhoria,
} from "../modules/mrhsabertas/mrhsabertas.controller.js";

import mrhsDocumentacaoRoutes from "../modules/mrhsdocumentacao/mrhsdocumentacao.routes.js";

import mrhsAgendamentoRoutes from "../modules/mrhsagendamento/mrhsAgendamento.routes.js";

import mrhsComentariosRoutes from "../modules/mrhscomentarios/mrhscomentarios.routes.js";

/* =======================================================
   IMPORTAÇÕES — CANDIDATOS
======================================================= */

import candidatosRoutes from "../modules/candidatos/candidatos.routes.js";

import fichaRoutes from "../modules/fichas/ficha.routes.js";

import candidatosRegistradosRoutes from "../modules/candidatosregistrados/candidatosregistrados.routes.js";

import checkDocsRoutes from "../modules/checkdocs/checkdocs.routes.js";

/* =======================================================
   IMPORTAÇÕES — EMAE
======================================================= */

import emaeRoutes from "../modules/emae/emae.routes.js";

/* =======================================================
   IMPORTAÇÕES — CONTRATOS
======================================================= */

import contractRoutes from "../modules/radarbp/contract.routes.js";

/* =======================================================
   IMPORTAÇÕES — RADAR BP
======================================================= */

import visitRoutes from "../modules/radarbp/visit.routes.js";

import trackingRoutes from "../modules/radarbp/tracking.routes.js";

import actionRoutes from "../modules/radarbp/action.routes.js";

import punctualActionRoutes from "../modules/radarbp/punctual-action.routes.js";

/* =======================================================
   IMPORTAÇÕES — RONDAS CORP
======================================================= */

import rondasRoutes from "../modules/rondasCorp/module/rondasCorpExport.routes.js";

import rondasLoginRoutes from "../modules/rondasCorp/login/rondasCorpLogin.routes.js";

/* =======================================================
   MIDDLEWARES
======================================================= */

import {
  authMiddleware,
} from "../modules/middlewares/auth.middleware.js";

import {
  authRondasCorp,
} from "../modules/rondasCorp/login/authRondasCorp.middleware.js";

/* =======================================================
   1. ROTAS PÚBLICAS

   Essas rotas não exigem token JWT.
   Devem estar antes do authMiddleware.
======================================================= */

/* AUTENTICAÇÃO */

router.use("/auth", authRoutes);

/* LOGIN RONDAS */

router.use("/rondas", rondasLoginRoutes);

/* =======================================================
   GRUPO GPS — LISTA DE PRESENÇA

   Endpoint existente:
   POST /api/melhorias

   Sem autenticação JWT.

   Ações disponíveis:
   - listar
   - adicionarConvidado
   - adicionarConvidadosLote
   - editarConvidado
   - excluirConvidado
   - definirPresenca
   - registrarWhatsappAberto
   - adicionarGerente
   - editarGerente
   - excluirGerente
   - editarEvento

   O controller gerencia o arquivo:
   data/presencas-evento.json
======================================================= */

router.post("/melhorias", salvarMelhoria);

/* EMAE PÚBLICO */

router.use("/emae", emaeRoutes);

/* =======================================================
   2. ROTAS RONDAS CORP

   Mantém a autenticação específica de Rondas.
======================================================= */

router.use(
  "/rondas",
  authRondasCorp,
  rondasRoutes,
);

/* =======================================================
   3. MIDDLEWARE GLOBAL DE AUTENTICAÇÃO

   A partir daqui, todas as rotas exigem JWT.

   Não afeta POST /api/melhorias declarado acima.
======================================================= */

router.use(authMiddleware);

/* =======================================================
   MRHS
======================================================= */

router.use(
  "/mrhsabertas",
  mrhsAbertasRoutes,
);

router.use(
  "/mrhsdocumentacao",
  mrhsDocumentacaoRoutes,
);

router.use(
  "/mrhsagendamento",
  mrhsAgendamentoRoutes,
);

router.use(
  "/mrhs",
  mrhsComentariosRoutes,
);

/* =======================================================
   CANDIDATOS
======================================================= */

router.use(
  "/candidatos",
  candidatosRoutes,
);

router.use(
  "/candidatosregistrados",
  candidatosRegistradosRoutes,
);

router.use(
  "/fichas",
  fichaRoutes,
);

router.use(
  "/checkdocs",
  checkDocsRoutes,
);

/* =======================================================
   CONTRATOS
======================================================= */

router.use(
  "/contracts",
  contractRoutes,
);

/* =======================================================
   RADAR BP
======================================================= */

router.use(
  "/visits",
  visitRoutes,
);

router.use(
  "/tracking",
  trackingRoutes,
);

router.use(
  "/actions",
  actionRoutes,
);

router.use(
  "/punctual-actions",
  punctualActionRoutes,
);

/* =======================================================
   EXPORTAÇÃO
======================================================= */

export default router;
