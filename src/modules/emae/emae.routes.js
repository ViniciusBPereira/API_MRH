import { Router } from "express";

import EmaeController
  from "./emae.controller.js";

import EmaePushController
  from "./emae.push.controller.js";

const router = Router();

router.get(
  "/health",
  (req, res) =>
    EmaeController.health(
      req,
      res,
    ),
);

router.get(
  "/sabara/monitoramento",
  (req, res) =>
    EmaeController.getSabaraMonitoring(
      req,
      res,
    ),
);

// ============================================================
// WEB PUSH
// ============================================================

router.get(
  "/push/public-key",
  (req, res) =>
    EmaePushController.getPublicKey(
      req,
      res,
    ),
);

router.post(
  "/push/subscribe",
  (req, res) =>
    EmaePushController.subscribe(
      req,
      res,
    ),
);

router.post(
  "/push/unsubscribe",
  (req, res) =>
    EmaePushController.unsubscribe(
      req,
      res,
    ),
);

router.post(
  "/push/test",
  (req, res) =>
    EmaePushController.test(
      req,
      res,
    ),
);

export default router;