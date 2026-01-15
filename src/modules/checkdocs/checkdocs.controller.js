import {
  listarChecklistService,
  criarItemChecklistService,
  atualizarCheckChecklistService,
  atualizarItemChecklistService,
  removerItemChecklistService,
  resumoChecklistService,
} from "./checkdocs.service.js";

/* -----------------------------------------------------
 * LISTAR CHECKLIST DO CANDIDATO (abre o modal)
 * GET /checkdocs/:idCandidato
 * ----------------------------------------------------- */
export async function listarChecklistController(req, res) {
  try {
    const idCandidato = Number(req.params.idCandidato);

    if (!idCandidato) {
      return res.status(400).json({ erro: "ID do candidato inválido." });
    }

    const lista = await listarChecklistService(idCandidato);
    return res.json(lista);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao listar checklist.",
      detalhe: error.message,
    });
  }
}

/* -----------------------------------------------------
 * CRIAR ITEM DE CHECKLIST
 * POST /checkdocs/:idCandidato
 * body: { nome, ordem? }
 * ----------------------------------------------------- */
export async function criarItemChecklistController(req, res) {
  try {
    const idCandidato = Number(req.params.idCandidato);

    if (!idCandidato) {
      return res.status(400).json({ erro: "ID do candidato inválido." });
    }

    const resultado = await criarItemChecklistService(idCandidato, req.body);

    return res.status(201).json(resultado);
  } catch (error) {
    return res.status(400).json({
      erro: "Erro ao criar item de checklist.",
      detalhe: error.message,
    });
  }
}

/* -----------------------------------------------------
 * ATUALIZAR SOMENTE O CHECK (checkbox)
 * PATCH /checkdocs/item/:idItem/check
 * body: { checked }
 * ----------------------------------------------------- */
export async function atualizarCheckChecklistController(req, res) {
  try {
    const idItem = Number(req.params.idItem);
    const { checked } = req.body;

    if (!idItem) {
      return res.status(400).json({ erro: "ID do item inválido." });
    }

    const resultado = await atualizarCheckChecklistService(idItem, checked);

    return res.json(resultado);
  } catch (error) {
    return res.status(400).json({
      erro: "Erro ao atualizar status do documento.",
      detalhe: error.message,
    });
  }
}

/* -----------------------------------------------------
 * ATUALIZAR ITEM (nome / ordem)
 * PUT /checkdocs/item/:idItem
 * body: { nome?, ordem? }
 * ----------------------------------------------------- */
export async function atualizarItemChecklistController(req, res) {
  try {
    const idItem = Number(req.params.idItem);

    if (!idItem) {
      return res.status(400).json({ erro: "ID do item inválido." });
    }

    const resultado = await atualizarItemChecklistService(idItem, req.body);

    return res.json(resultado);
  } catch (error) {
    return res.status(400).json({
      erro: "Erro ao atualizar item de checklist.",
      detalhe: error.message,
    });
  }
}

/* -----------------------------------------------------
 * REMOVER ITEM
 * DELETE /checkdocs/item/:idItem
 * ----------------------------------------------------- */
export async function removerItemChecklistController(req, res) {
  try {
    const idItem = Number(req.params.idItem);

    if (!idItem) {
      return res.status(400).json({ erro: "ID do item inválido." });
    }

    const resultado = await removerItemChecklistService(idItem);
    return res.json(resultado);
  } catch (error) {
    return res.status(400).json({
      erro: "Erro ao remover item de checklist.",
      detalhe: error.message,
    });
  }
}

/* -----------------------------------------------------
 * 🔥 RESUMO DA DOCUMENTAÇÃO (para grid)
 * GET /checkdocs/resumo/:idCandidato
 * ----------------------------------------------------- */
export async function resumoChecklistController(req, res) {
  try {
    const idCandidato = Number(req.params.idCandidato);

    if (!idCandidato) {
      return res.status(400).json({ erro: "ID do candidato inválido." });
    }

    const resumo = await resumoChecklistService(idCandidato);
    return res.json(resumo);
  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao obter resumo da documentação.",
      detalhe: error.message,
    });
  }
}
