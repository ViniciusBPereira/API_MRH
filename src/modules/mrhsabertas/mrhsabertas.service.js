import repo from "./mrhsabertas.repository.js";
import mapaEscala from "../constants/mapaEscala.js";
import mapaEmpresa from "../constants/mapaEmpresa.js";
import cache from "../../cache/localcache.js";

/**
 * Inicialização de cache estático
 */
if (!cache.has("mapaEscala")) {
  cache.set("mapaEscala", mapaEscala);
}

if (!cache.has("mapaEmpresa")) {
  cache.set("mapaEmpresa", mapaEmpresa);
}

/**
 * Capitaliza a primeira letra de cada palavra.
 */
const capitalizeFirstLetterEachWord = (str) => {
  if (!str || typeof str !== "string") return str;
  if (/^\d+$/.test(str)) return str;

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Converte uma data para o formato YYYY-MM-DD
 */
const formatDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

/**
 * Mapeia o motivo da admissão
 */
const mapMotivoAdmissao = (valor) => {
  if (valor === "1" || valor === 1) return "Aumento de Escopo";
  if (valor === "2" || valor === 2) return "Substituição";
  return "Não informado";
};

/**
 * 🔹 LISTAGEM – MRHs abertas (time = SELECAO)
 */
export async function listarMRHsAbertas() {
  const method = "listarMRHsAbertas";
  const startTime = Date.now();

  console.info(`[SERVICE] ${method} - Início da execução`);

  try {
    const dados = await repo.getAll();
    const hoje = new Date();

    const mapaEscalaCache = cache.get("mapaEscala");
    const mapaEmpresaCache = cache.get("mapaEmpresa");

    console.info(`[SERVICE] ${method} - Registros recebidos do repository`, {
      total: dados.length,
    });

    const dadosCompletos = dados.map((item) => {
      const dataAbertura = formatDateOnly(item.data_registro);

      const diasEmAberto = Math.floor(
        (hoje - new Date(item.data_registro)) / (1000 * 60 * 60 * 24),
      );

      const escalaDescricao = capitalizeFirstLetterEachWord(
        mapaEscalaCache[item.escala] || "Não informado",
      );

      const empresaDescricao = capitalizeFirstLetterEachWord(
        mapaEmpresaCache[item.ad_filial] || "Empresa não mapeada",
      );

      const endereco = `${capitalizeFirstLetterEachWord(
        (item.municipiocr || "").trim(),
      )}, ${capitalizeFirstLetterEachWord(
        (item.bairrocr || "").trim(),
      )} - CEP: ${item.cepcr || ""}`;

      const periodo = `${item.horaentrada || ""} - ${item.horasaida || ""}`;
      const crTratado = item.desccr?.split(" - ").slice(1).join(" - ") || "";

      return {
        data_abertura: dataAbertura,
        dias_em_aberto: diasEmAberto,

        mrh: capitalizeFirstLetterEachWord(item.mrh),
        empresa: empresaDescricao,
        escala: escalaDescricao,
        endereco,
        funcao: capitalizeFirstLetterEachWord(item.descfuncao),
        periodo,

        status_rh: item.status_rh,
        status_dp: item.status_dp,
        motivo_admissao: mapMotivoAdmissao(item.motivo_admissao),

        cr: crTratado,
        usuario_abertura: capitalizeFirstLetterEachWord(
          item.nome_user_abertura,
        ),
        responsavel: capitalizeFirstLetterEachWord(item.nome_responsavel),
        diretor: capitalizeFirstLetterEachWord(item.ctt_xndire),
        gerente_regional: capitalizeFirstLetterEachWord(item.ctt_xngerr),
        gerente: capitalizeFirstLetterEachWord(item.ctt_xngere),
        supervisor: capitalizeFirstLetterEachWord(item.ctt_xnsupe),

        salario: Number(item.ad_salario) || 0,
        total_candidatos: item.total_candidatos,
        total_comentarios: item.total_comentarios,
      };
    });

    const dadosOrdenados = dadosCompletos.sort(
      (a, b) => new Date(b.data_abertura || 0) - new Date(a.data_abertura || 0),
    );

    console.info(`[SERVICE] ${method} - Execução finalizada`, {
      total_retornado: dadosOrdenados.length,
      tempo_execucao_ms: Date.now() - startTime,
    });

    return dadosOrdenados;
  } catch (error) {
    console.error(`[SERVICE] ${method} - Erro`, {
      mensagem: error.message,
      stack: error.stack,
      tempo_execucao_ms: Date.now() - startTime,
    });

    throw new Error("Erro ao listar MRHs abertas.");
  }
}

/**
 * 🔹 AÇÃO – mover MRH do time SELECAO para DOCUMENTACAO
 */
export async function moverMRHParaDocumentacao(mrhId) {
  const method = "moverMRHParaDocumentacao";
  const startTime = Date.now();

  console.info(`[SERVICE] ${method} - Início`, { mrhId });

  if (!mrhId) {
    throw new Error("ID da MRH não informado.");
  }

  const resultado = await repo.moverParaDocumentacao(mrhId);

  if (!resultado) {
    throw new Error("MRH não encontrada ou já movida para Documentação.");
  }

  console.info(`[SERVICE] ${method} - MRH atualizada`, {
    mrhId,
    novo_time: resultado.time,
    tempo_execucao_ms: Date.now() - startTime,
  });

  return resultado;
}
