import repo from "./mrhsabertas.repository.js";
import mapaEscala from "../constants/mapaEscala.js";
import mapaEmpresa from "../constants/mapaEmpresa.js";
import cache from "../../cache/localcache.js";

/**
 * Inicialização de cache estático
 * Esses mapas são carregados apenas uma vez na aplicação
 */
if (!cache.has("mapaEscala")) {
  cache.set("mapaEscala", mapaEscala);
}

if (!cache.has("mapaEmpresa")) {
  cache.set("mapaEmpresa", mapaEmpresa);
}

/**
 * Capitaliza a primeira letra de cada palavra.
 * Números e valores inválidos são retornados sem alteração.
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
 * Mapeia o motivo da admissão para descrição legível
 */
const mapMotivoAdmissao = (valor) => {
  if (valor === "1" || valor === 1) return "Aumento de Escopo";
  if (valor === "2" || valor === 2) return "Substituição";
  return "Não informado";
};

/**
 * Service responsável por listar MRHs abertas
 * já com dados tratados para consumo no frontend.
 *
 * Responsabilidades:
 * - Orquestrar acesso ao repository
 * - Aplicar regras de negócio
 * - Normalizar e formatar dados
 * - Adicionar informações derivadas
 * - Gerar logs de produção
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

      const dataRegistroObj = new Date(item.data_registro);
      const diasEmAberto = Math.floor(
        (hoje - dataRegistroObj) / (1000 * 60 * 60 * 24)
      );

      const escalaDescricao = capitalizeFirstLetterEachWord(
        mapaEscalaCache[item.escala] || "Não informado"
      );

      const empresaDescricao = capitalizeFirstLetterEachWord(
        mapaEmpresaCache[item.ad_filial] || "Empresa não mapeada"
      );

      const municipio = capitalizeFirstLetterEachWord(
        (item.municipiocr || "").trim()
      );
      const bairro = capitalizeFirstLetterEachWord(
        (item.bairrocr || "").trim()
      );
      const cep = item.cepcr || "";

      const endereco = `${municipio}, ${bairro} - CEP: ${cep}`;
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
          item.nome_user_abertura
        ),
        responsavel: capitalizeFirstLetterEachWord(item.nome_responsavel),
        diretor: capitalizeFirstLetterEachWord(item.ctt_xndire),
        gerente_regional: capitalizeFirstLetterEachWord(item.ctt_xngerr),
        gerente: capitalizeFirstLetterEachWord(item.ctt_xngere),
        supervisor: capitalizeFirstLetterEachWord(item.ctt_xnsupe),

        // 🔥 NOVOS CAMPOS (AJUSTE PEDIDO)
        total_candidatos: item.total_candidatos,
        total_comentarios: item.total_comentarios,
      };
    });

    const dadosOrdenados = dadosCompletos.sort((a, b) => {
      const va = a.data_abertura ? new Date(a.data_abertura).getTime() : 0;
      const vb = b.data_abertura ? new Date(b.data_abertura).getTime() : 0;
      return vb - va;
    });

    const duration = Date.now() - startTime;

    console.info(`[SERVICE] ${method} - Execução finalizada com sucesso`, {
      total_retornado: dadosOrdenados.length,
      tempo_execucao_ms: duration,
    });

    return dadosOrdenados;
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`[SERVICE] ${method} - Erro na execução`, {
      mensagem: error.message,
      stack: error.stack,
      tempo_execucao_ms: duration,
    });

    throw new Error("Erro ao listar MRHs abertas.");
  }
}
