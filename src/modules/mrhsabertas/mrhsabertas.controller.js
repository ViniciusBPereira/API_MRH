
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  listarMRHsAbertas,
  moverMRHParaDocumentacao,
} from "./mrhsabertas.service.js";

/* =========================================================
   MELHORIAS — ARMAZENAMENTO EM JSON

   Cria data/melhorias.json na raiz do backend.
   A fila evita sobrescrita entre requisições atendidas pelo
   mesmo processo Node.js.
   ========================================================= */
const ARQUIVO_MELHORIAS = fileURLToPath(
  new URL("../../../data/melhorias.json", import.meta.url),
);

let filaMelhorias = Promise.resolve();

const limparTexto = (valor) =>
  typeof valor === "string" ? valor.trim() : "";

async function gravarMelhoriaNoJson(novaMelhoria) {
  await mkdir(dirname(ARQUIVO_MELHORIAS), { recursive: true });

  let melhorias = [];

  try {
    const conteudo = await readFile(ARQUIVO_MELHORIAS, "utf8");
    melhorias = JSON.parse(conteudo);

    if (!Array.isArray(melhorias)) {
      throw new Error("O arquivo de melhorias não contém uma lista JSON.");
    }
  } catch (erro) {
    if (erro.code !== "ENOENT") {
      throw erro;
    }
  }

  melhorias.push(novaMelhoria);

  // Substituição atômica do arquivo (no mesmo volume).
  const temporario = `${ARQUIVO_MELHORIAS}.${randomUUID()}.tmp`;

  try {
    await writeFile(
      temporario,
      JSON.stringify(melhorias, null, 2),
      "utf8",
    );

    await rename(temporario, ARQUIVO_MELHORIAS);
  } finally {
    await rm(temporario, { force: true }).catch(() => {});
  }

  return melhorias.length;
}

/**
 * Controller responsável por MRHs abertas (time = SELECAO).
 */
export async function getMRHsAbertas(req, res) {
  const controller = "MRHsAbertasController.getMRHsAbertas";
  const startTime = Date.now();

  const usuarioAtual = req.user?.nome || "Desconhecido";

  try {
    console.info(`[CONTROLLER] ${controller} - Requisição iniciada`, {
      usuario: usuarioAtual,
      rota: req.originalUrl,
      metodo: req.method,
    });

    const resultado = await listarMRHsAbertas();

    console.info(
      `[CONTROLLER] ${controller} - Requisição concluída com sucesso`,
      {
        usuario: usuarioAtual,
        total_mrhs: resultado.length,
        tempo_execucao_ms: Date.now() - startTime,
      },
    );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - Erro ao processar requisição`, {
      usuario: usuarioAtual,
      mensagem: error.message,
      stack: error.stack,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return res.status(500).json({
      message: "Erro ao buscar MRHs em aberto",
    });
  }
}

/**
 * POST /api/melhorias
 * Recebe uma sugestão do formulário NPSMonitor e salva em JSON.
 */
export async function salvarMelhoria(req, res) {
  const controller = "MRHsAbertasController.salvarMelhoria";
  const startTime = Date.now();

  try {
    const { name, area, title, desc, impact, effort } = req.body ?? {};

    const dados = {
      name: limparTexto(name) || "Anônimo",
      area: limparTexto(area),
      title: limparTexto(title),
      desc: limparTexto(desc),
      impact: limparTexto(impact),
      effort: limparTexto(effort),
    };

    const niveisValidos = ["Baixo", "Médio", "Alto"];

    if (
      !dados.area ||
      !dados.title ||
      !dados.desc ||
      dados.name.length > 40 ||
      dados.area.length > 60 ||
      dados.title.length > 80 ||
      dados.desc.length > 400 ||
      !niveisValidos.includes(dados.impact) ||
      !niveisValidos.includes(dados.effort)
    ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Dados inválidos. Verifique os campos da melhoria.",
      });
    }

    const novaMelhoria = {
      id: randomUUID(),
      enviado_em: new Date().toISOString(),
      ...dados,
    };

    // Enfileira a leitura/gravação para não perder envios simultâneos
    // dentro do mesmo processo Node.js.
    const operacao = filaMelhorias.then(() =>
      gravarMelhoriaNoJson(novaMelhoria)
    );

    filaMelhorias = operacao.catch(() => {});

    const total = await operacao;

    console.info(`[CONTROLLER] ${controller} - Melhoria salva`, {
      melhoria_id: novaMelhoria.id,
      area: novaMelhoria.area,
      total_melhorias: total,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Melhoria registrada com sucesso!",
      data: novaMelhoria,
    });
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - Erro ao salvar melhoria`, {
      mensagem: error.message,
      stack: error.stack,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return res.status(500).json({
      sucesso: false,
      mensagem: "Não foi possível registrar a melhoria.",
    });
  }
}

/**
 * 🔹 Controller responsável por mover MRH
 * do time SELECAO para DOCUMENTACAO
 */
export async function moverMRH(req, res) {
  const controller = "MRHsAbertasController.moverMRH";
  const startTime = Date.now();

  const usuarioAtual = req.user?.nome || "Desconhecido";
  const { id } = req.params;

  try {
    console.info(`[CONTROLLER] ${controller} - Requisição iniciada`, {
      usuario: usuarioAtual,
      mrh_id: id,
      rota: req.originalUrl,
      metodo: req.method,
    });

    const resultado = await moverMRHParaDocumentacao(id);

    console.info(`[CONTROLLER] ${controller} - MRH movida com sucesso`, {
      usuario: usuarioAtual,
      mrh_id: id,
      novo_time: resultado.time,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "MRH movida para o time de Documentação",
      data: resultado,
    });
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - Erro ao mover MRH`, {
      usuario: usuarioAtual,
      mrh_id: id,
      mensagem: error.message,
      stack: error.stack,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return res.status(400).json({
      sucesso: false,
      message: error.message || "Erro ao mover MRH para Documentação",
    });
  }
}
