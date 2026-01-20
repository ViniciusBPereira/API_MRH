import {
  listarPorMRH,
  criarCandidato,
  atualizarCandidato,
  removerCandidato,
  anexarDocumento,
  importarCSVService,
  fichaCandidatoService,
  listarDocumentosService,
  removerDocumentoService,
  atualizarStatus,
  atualizarValidacaoIndividual, // ✅ NOVO
} from "./candidatos.service.js";

/* -----------------------------------------------------
 * LISTAR CANDIDATOS POR MRH
 * ----------------------------------------------------- */
export async function getCandidatos(req, res) {
  try {
    const mrhId = req.params.mrhId;
    const usuario = req.user?.nome || "Desconhecido";

    const lista = await listarPorMRH(mrhId);

    console.log(
      `[CANDIDATOS] Usuário '${usuario}' consultou candidatos da MRH ${mrhId}`
    );

    return res.status(200).json(lista);
  } catch (error) {
    console.error("Erro getCandidatos:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar candidatos.",
    });
  }
}

/* -----------------------------------------------------
 * CRIAR CANDIDATO
 * ----------------------------------------------------- */
export async function postCandidato(req, res) {
  try {
    const mrhId = req.params.mrhId;
    const novo = await criarCandidato(mrhId, req.body);

    return res.status(201).json(novo);
  } catch (error) {
    console.error("Erro postCandidato:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar candidato.",
    });
  }
}

/* -----------------------------------------------------
 * ATUALIZAR CANDIDATO (completo)
 * ----------------------------------------------------- */
export async function putCandidato(req, res) {
  try {
    const atualizado = await atualizarCandidato(req.params.id, req.body);
    return res.status(200).json(atualizado);
  } catch (error) {
    console.error("Erro putCandidato:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar candidato.",
    });
  }
}

/* -----------------------------------------------------
 * 🔥 ATUALIZAR APENAS STATUS
 * ----------------------------------------------------- */
export async function putStatus(req, res) {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const resultado = await atualizarStatus(id, status);

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro putStatus:", error);
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message || "Erro ao atualizar status.",
    });
  }
}

/* -----------------------------------------------------
 * 🔥 NOVO — ATUALIZAR UMA VALIDAÇÃO INDIVIDUAL
 * ----------------------------------------------------- */
export async function putValidacaoIndividual(req, res) {
  try {
    const id = req.params.id;
    const { campo, valor } = req.body;

    const resultado = await atualizarValidacaoIndividual(id, campo, valor);

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro putValidacaoIndividual:", error);
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message || "Erro ao atualizar validação.",
    });
  }
}

/* -----------------------------------------------------
 * REMOVER CANDIDATO
 * ----------------------------------------------------- */
export async function deleteCandidato(req, res) {
  try {
    const { id } = req.params;

    await removerCandidato(id);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Candidato removido com sucesso.",
    });
  } catch (error) {
    console.error("Erro deleteCandidato:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao remover candidato.",
    });
  }
}

/* -----------------------------------------------------
 * UPLOAD DE DOCUMENTO
 * ----------------------------------------------------- */
export async function uploadDocumento(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nenhum arquivo enviado.",
      });
    }

    const resultado = await anexarDocumento(req.params.id, req.file.filename);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro uploadDocumento:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao anexar documento.",
    });
  }
}

/* -----------------------------------------------------
 * LISTAR DOCUMENTOS DO CANDIDATO
 * ----------------------------------------------------- */
export async function listarDocumentos(req, res) {
  try {
    const docs = await listarDocumentosService(req.params.id);
    return res.status(200).json(docs);
  } catch (error) {
    console.error("Erro listarDocumentos:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar documentos.",
    });
  }
}

/* -----------------------------------------------------
 * REMOVER DOCUMENTO INDIVIDUAL
 * ----------------------------------------------------- */
export async function deleteDocumento(req, res) {
  try {
    const { id, nome } = req.params;
    const resultado = await removerDocumentoService(id, nome);

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro deleteDocumento:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao remover documento.",
    });
  }
}

/* -----------------------------------------------------
 * IMPORTAR CSV
 * ----------------------------------------------------- */
export async function importarCSV(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nenhum arquivo CSV enviado.",
      });
    }

    const resultado = await importarCSVService(
      req.params.mrhId,
      req.file.buffer
    );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro importarCSV:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao importar CSV.",
    });
  }
}

/* -----------------------------------------------------
 * FICHA COMPLETA DO CANDIDATO
 * ----------------------------------------------------- */
export async function getFicha(req, res) {
  try {
    const ficha = await fichaCandidatoService(req.params.id);

    if (!ficha) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Candidato não encontrado.",
      });
    }

    return res.status(200).json(ficha);
  } catch (error) {
    console.error("Erro getFicha:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar ficha.",
    });
  }
}
