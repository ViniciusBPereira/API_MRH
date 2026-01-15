// ficha.controller.js
import { criarFicha, atualizarFicha, buscarFicha } from "./ficha.service.js";

export async function getFicha(req, res) {
  try {
    const ficha = await buscarFicha(req.params.id);

    if (!ficha) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Ficha não encontrada.",
      });
    }

    return res.status(200).json(ficha);
  } catch (error) {
    console.error("[FICHA] Erro ao buscar:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar ficha.",
    });
  }
}

export async function postFicha(req, res) {
  try {
    const candidatoId = req.params.candidatoId;

    const ficha = await criarFicha(candidatoId, req.body);

    return res.status(201).json(ficha);
  } catch (error) {
    console.error("[FICHA] Erro ao criar:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar ficha.",
    });
  }
}

export async function putFicha(req, res) {
  try {
    const ficha = await atualizarFicha(req.params.id, req.body);

    return res.status(200).json(ficha);
  } catch (error) {
    console.error("[FICHA] Erro ao atualizar:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar ficha.",
    });
  }
}
