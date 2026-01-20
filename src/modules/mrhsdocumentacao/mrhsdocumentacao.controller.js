import {
  listarMRHsDocumentacao,
  listarItensDocumentosPorCpf,
  criarItemDocumentoPorCpf,
  registrarUploadDocumentoPorCpf,
  listarUploadsPorCpf,
  atualizarExamePorMrh,
  concluirEtapaPorMrh, // ✅ NOVO
} from "./mrhsdocumentacao.service.js";

/* =====================================================
   📄 GET /mrhsdocumentacao
===================================================== */
export async function getMRHsDocumentacao(req, res) {
  const controller = "getMRHsDocumentacao";
  const start = Date.now();

  try {
    const resultado = await listarMRHsDocumentacao();

    return res.status(200).json(resultado);
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - erro`, error);
    return res.status(500).json({
      message: "Erro ao buscar MRHs do time de documentação.",
    });
  }
}

/* =====================================================
   📎 GET /mrhsdocumentacao/itens/:cpf
===================================================== */
export async function getItensDocumentacaoPorCpf(req, res) {
  try {
    const { cpf } = req.params;
    if (!cpf) return res.status(400).json({ message: "CPF é obrigatório." });

    const itens = await listarItensDocumentosPorCpf(cpf);
    return res.status(200).json(itens);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar itens de documentação.",
    });
  }
}

/* =====================================================
   ➕ POST /mrhsdocumentacao/itens/:cpf
===================================================== */
export async function criarItemDocumentacaoPorCpf(req, res) {
  try {
    const { cpf } = req.params;
    const { nome, ordem } = req.body;

    if (!cpf || !nome) {
      return res.status(400).json({
        message: "CPF e nome do documento são obrigatórios.",
      });
    }

    const itemCriado = await criarItemDocumentoPorCpf({
      cpf,
      nome,
      ordem,
    });

    return res.status(201).json(itemCriado);
  } catch (error) {
    if (error.code === "CANDIDATO_NAO_LOCALIZADO") {
      return res.status(404).json({
        message: "Candidato não localizado no sistema.",
      });
    }

    return res.status(500).json({
      message: "Erro ao criar item de documentação.",
    });
  }
}

/* =====================================================
   📂 GET /mrhsdocumentacao/upload/:cpf
===================================================== */
export async function listarUploadsDocumentoPorCpf(req, res) {
  try {
    const { cpf } = req.params;
    if (!cpf) return res.status(400).json({ message: "CPF é obrigatório." });

    const uploads = await listarUploadsPorCpf(cpf);
    return res.status(200).json(Array.isArray(uploads) ? uploads : []);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar documentos do candidato.",
    });
  }
}

/* =====================================================
   📤 POST /mrhsdocumentacao/upload/:cpf
===================================================== */
export async function uploadDocumentoPorCpf(req, res) {
  try {
    const { cpf } = req.params;
    if (!cpf || !req.file) {
      return res.status(400).json({
        message: "CPF e arquivo são obrigatórios.",
      });
    }

    const upload = await registrarUploadDocumentoPorCpf({
      cpf,
      file: req.file,
    });

    return res.status(201).json(upload);
  } catch (error) {
    if (error.code === "CANDIDATO_NAO_LOCALIZADO") {
      return res.status(404).json({
        message: "Candidato não localizado no sistema.",
      });
    }

    return res.status(500).json({
      message: "Erro ao realizar upload do documento.",
    });
  }
}

/* =====================================================
   ✏️ PATCH /mrhsdocumentacao/exame/:mrh
===================================================== */
export async function atualizarExame(req, res) {
  try {
    const { mrh } = req.params;
    const { exame } = req.body;

    const valor = await atualizarExamePorMrh({ mrh, exame });
    return res.status(200).json({ exame: valor });
  } catch (error) {
    if (error.code === "MRH_NAO_LOCALIZADO") {
      return res.status(404).json({
        message: "MRH não localizada no sistema.",
      });
    }

    return res.status(500).json({
      message: "Erro ao salvar exame.",
    });
  }
}

/* =====================================================
   ✅ PATCH /mrhsdocumentacao/concluir/:mrh
   Ação do botão ✔
===================================================== */
export async function concluirEtapa(req, res) {
  try {
    const { mrh } = req.params;

    await concluirEtapaPorMrh(mrh);

    return res.status(200).json({
      message: "MRH concluída com sucesso.",
    });
  } catch (error) {
    if (error.code === "MRH_NAO_LOCALIZADO") {
      return res.status(404).json({
        message: "MRH não localizada no sistema.",
      });
    }

    return res.status(500).json({
      message: "Erro ao concluir MRH.",
    });
  }
}
