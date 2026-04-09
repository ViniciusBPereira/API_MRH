import { Router } from "express";
import { buscarNPS } from "./nps.service.js";

const router = Router();

router.get("/", async (req, res) => {
  const dados = await buscarNPS();
  res.json(dados);
});

export default router;