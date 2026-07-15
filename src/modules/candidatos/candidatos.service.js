import repo from "./candidatos.repository.js";
import fichaRepo from "../fichas/ficha.repository.js";
import { parseArquivo } from "./candidatos.csv.js";

/* -----------------------------------------------------
 * FORMATADOR DE STRINGS
 * ----------------------------------------------------- */
const capitalize = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

/* Sanitização de docs/jsonb */
const sanitizeDocs = (docs) => {
  if (!docs) return [];
  if (typeof docs === "string") {
    try {
      docs = JSON.parse(docs);
    } catch {
      return [];
    }
  }
  return Array.isArray(docs) ? docs : [];
};

/* -----------------------------------------------------
 * LISTAR POR MRH — 🔥 NORMALIZAÇÃO COMPLETA
 * ----------------------------------------------------- */
export async function listarPorMRH(mrhId) {
  const lista = await repo.getByMRH(mrhId);

  return lista.map((item) => ({
    ...item,

    nome: capitalize(item.nome),
    endereco: "",
    docs: sanitizeDocs(item.docs),

    // 🔥 NORMALIZAÇÃO DOS CAMPOS QUE O FRONT ESPERA
    validacaoAPT: item.validacaoapt,
    validacaoCARD: item.validacaocard,
    validacaoOcorrencias: item.validacaoocorrencias,
    validacaoBrickPF: item.validacaobrickpf,
    validacaoBrickMandado: item.validacaobrickmandado,
    validacaoBrickProcessos: item.validacaobrickprocessos,
    validacaoEndereco: item.validacaoendereco,
    validacaoSegundaEtapa: item.validacaosegundaetapa,
    validacaoDocumentos: item.validacaodocumentos,
    validacaoCurriculoGPSvc: item.validacaocurriculogpsvc,
    validacaoReservista: item.validacaoreservista,
  }));
}

/* -----------------------------------------------------
 * CRIAR
 * ----------------------------------------------------- */
export async function criarCandidato(mrhId, data) {
  return await repo.create(mrhId, {
    ...data,
    docs: sanitizeDocs(data.docs),
  });
}

/* -----------------------------------------------------
 * ATUALIZAR COMPLETO
 * ----------------------------------------------------- */
export async function atualizarCandidato(id, data) {
  return await repo.update(id, {
    ...data,
    docs: sanitizeDocs(data.docs),
  });
}

/* -----------------------------------------------------
 * 🔥 ATUALIZAR SOMENTE STATUS
 * ----------------------------------------------------- */
export async function atualizarStatus(id, status) {
  const normalizado = status || "";

  if (!["", "Selecionado"].includes(normalizado)) {
    throw new Error(
      "Status inválido. Use '' (Não Selecionado) ou 'Selecionado'.",
    );
  }

  const atualizado = await repo.updateStatus(id, normalizado);

  return {
    sucesso: true,
    mensagem: "Status atualizado.",
    candidato: atualizado,
  };
}

/* -----------------------------------------------------
 * 🔥 ATUALIZAR UMA VALIDAÇÃO INDIVIDUAL
 * ----------------------------------------------------- */
export async function atualizarValidacaoIndividual(id, campo, valor) {
  const permitido = ["pendente", "aprovado", "rejeitado", "não necessário"];
  const normalizado = permitido.includes(valor) ? valor : "pendente";

  const colunasValidas = [
    "validacaoAPT",
    "validacaoCARD",
    "validacaoOcorrencias",
    "validacaoBrickPF",
    "validacaoBrickMandado",
    "validacaoBrickProcessos",
    "validacaoEndereco",
    "validacaoSegundaEtapa",
    "validacaoDocumentos",
    "validacaoCurriculoGPSvc",
    "validacaoReservista",
  ];

  if (!colunasValidas.includes(campo)) {
    throw new Error("Campo de validação inválido.");
  }

  const atualizado = await repo.updateValidacaoIndividual(
    id,
    campo,
    normalizado,
  );

  return {
    sucesso: true,
    mensagem: `Validação '${campo}' atualizada para '${normalizado}'.`,
    candidato: atualizado,
  };
}

/* -----------------------------------------------------
 * REMOVER
 * ----------------------------------------------------- */
export async function removerCandidato(id) {
  await repo.delete(id);
  return { sucesso: true };
}

/* -----------------------------------------------------
 * LISTAR DOCUMENTOS
 * ----------------------------------------------------- */
export async function listarDocumentosService(id) {
  const candidato = await repo.getById(id);
  if (!candidato) return [];
  return sanitizeDocs(candidato.docs);
}

/* -----------------------------------------------------
 * ANEXAR DOCUMENTO
 * ----------------------------------------------------- */
export async function anexarDocumento(id, fileName) {
  const candidato = await repo.getById(id);
  if (!candidato) throw new Error("Candidato não encontrado.");

  let docs = sanitizeDocs(candidato.docs);

  const novoDoc = {
    nome: fileName,
    path: `/uploads/candidatos/${fileName}`,
    data_upload: new Date().toISOString(),
  };

  docs.push(novoDoc);

  const atualizado = await repo.updateDocs(id, docs);

  return {
    sucesso: true,
    mensagem: "Documento anexado com sucesso.",
    documentos: docs,
    candidato: atualizado,
  };
}

/* -----------------------------------------------------
 * REMOVER DOCUMENTO
 * ----------------------------------------------------- */
export async function removerDocumentoService(id, fileName) {
  const atualizado = await repo.removeDocument(id, fileName);

  return {
    sucesso: true,
    documentos: sanitizeDocs(atualizado.docs),
  };
}

/* -----------------------------------------------------
 * IMPORTAÇÃO CSV
 * ----------------------------------------------------- */
export async function importarCSVService(mrhId, file) {
  const linhas = await parseArquivo(file);
  let inseridos = 0;

  for (const linha of linhas) {
    await repo.create(mrhId, {
      nome: linha.nome || "",
      cpf: linha.cpf || "",
      telefone: linha.telefone || "",
      email: linha.email || "",
      endereco: linha.endereco || "",
      status: "",
      pre_selecao: "",
      ex_colaborador: false,
      brick: false,
      vt: 0,
      observacoes: "",
      docs: [],
    });

    inseridos++;
  }

  return {
    sucesso: true,
    mensagem: `Importação concluída: ${inseridos} candidatos.`,
  };
}

/* -----------------------------------------------------
 * FICHA COMPLETA DO CANDIDATO
 * ----------------------------------------------------- */
export async function fichaCandidatoService(candidatoId) {
  const candidato = await repo.getById(candidatoId);
  if (!candidato) return null;

  const documentos = sanitizeDocs(candidato.docs);

  const base = {
    id: candidato.id,
    nome: candidato.nome,
    cpf: candidato.cpf,
    telefone: candidato.telefone,
    email: candidato.email,
    endereco: candidato.endereco,
    status: candidato.status,
    observacoes: candidato.observacoes,
    documentos,
  };

  if (candidato.ficha_id) {
    const ficha = await fichaRepo.getById(candidato.ficha_id);
    return { candidato: base, ficha };
  }

  return { candidato: base, ficha: null };
}
/* -----------------------------------------------------
 * MOVER CANDIDATO PARA OUTRA MRH
 * ----------------------------------------------------- */
export async function moverCandidatoParaMrh(candidatoId, novaMrh) {
  if (!candidatoId) {
    throw new Error("Candidato não informado.");
  }

  if (!novaMrh) {
    throw new Error("Nova MRH não informada.");
  }

  // Verifica se a MRH existe
  const existe = await repo.existeMrh(novaMrh);

  if (!existe) {
    const err = new Error("A MRH informada não existe.");
    err.code = "MRH_NAO_EXISTE";
    throw err;
  }

  // Move o candidato
  const candidato = await repo.moverParaMrh(candidatoId, novaMrh);

  if (!candidato) {
    const err = new Error("Candidato não encontrado.");
    err.code = "CANDIDATO_NAO_ENCONTRADO";
    throw err;
  }

  return {
    sucesso: true,
    mensagem: "Candidato movido com sucesso.",
    candidato,
  };
}
