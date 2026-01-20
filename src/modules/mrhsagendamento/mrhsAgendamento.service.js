import repo from "./mrhsAgendamento.repository.js";
import mapaEscala from "../constants/mapaEscala.js";
import mapaEmpresa from "../constants/mapaEmpresa.js";
import cache from "../../cache/localcache.js";

/* =====================================================
   CACHE
===================================================== */
if (!cache.has("mapaEscala")) cache.set("mapaEscala", mapaEscala);
if (!cache.has("mapaEmpresa")) cache.set("mapaEmpresa", mapaEmpresa);

/* =====================================================
   UTILITÁRIOS
===================================================== */
const capitalizeFirstLetterEachWord = (str) => {
  if (!str || typeof str !== "string") return str;
  if (/^\d+$/.test(str)) return str;

  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const formatDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const mapMotivoAdmissao = (valor) => {
  if (valor === "1" || valor === 1) return "Aumento de Escopo";
  if (valor === "2" || valor === 2) return "Substituição";
  return "Não informado";
};

/* =====================================================
   📄 LISTAR MRHs — TIME DE AGENDAMENTO
   ✔ apenas etapa = 1 (repository)
===================================================== */
export async function listarMRHsAgendamento() {
  console.info("[SERVICE] listarMRHsAgendamento - Início");

  const dados = await repo.getAll();
  const hoje = new Date();

  const mapaEscalaCache = cache.get("mapaEscala");
  const mapaEmpresaCache = cache.get("mapaEmpresa");

  return dados
    .map((item) => {
      let dias = null;

      if (item.data_finalizacao_rh) {
        dias = Math.floor(
          (hoje - new Date(item.data_finalizacao_rh)) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        data_abertura: formatDateOnly(item.data_registro),
        data_finalizacao_rh: formatDateOnly(item.data_finalizacao_rh),
        dias_em_aberto: dias,

        mrh: capitalizeFirstLetterEachWord(item.mrh),
        empresa: capitalizeFirstLetterEachWord(
          mapaEmpresaCache[item.ad_filial] || "Empresa não mapeada"
        ),
        escala: capitalizeFirstLetterEachWord(
          mapaEscalaCache[item.escala] || "Não informado"
        ),
        endereco: `${capitalizeFirstLetterEachWord(
          item.municipiocr || ""
        )}, ${capitalizeFirstLetterEachWord(item.bairrocr || "")} - CEP: ${
          item.cepcr || ""
        }`,
        funcao: capitalizeFirstLetterEachWord(item.descfuncao),
        periodo: `${item.horaentrada || ""} - ${item.horasaida || ""}`,

        nome_colaborador: capitalizeFirstLetterEachWord(item.nome_colaborador),
        cpf_colaborador: item.cpf_colaborador,

        status_rh: item.status_rh,
        status_dp: item.status_dp,
        motivo_admissao: mapMotivoAdmissao(item.motivo_admissao),

        cr: item.desccr?.split(" - ").slice(1).join(" - ") || "",
        usuario_abertura: capitalizeFirstLetterEachWord(
          item.nome_user_abertura
        ),
        responsavel: capitalizeFirstLetterEachWord(item.nome_responsavel),
        diretor: capitalizeFirstLetterEachWord(item.ctt_xndire),
        gerente_regional: capitalizeFirstLetterEachWord(item.ctt_xngerr),
        gerente: capitalizeFirstLetterEachWord(item.ctt_xngere),
        supervisor: capitalizeFirstLetterEachWord(item.ctt_xnsupe),

        // ===== CAMPOS DO AGENDAMENTO =====
        exame: item.exame ?? "",
        uniformes: item.uniformes ?? "",
        data_integracao: item.data_integracao ?? "",
        data_admissao: item.data_admissao ?? "",
      };
    })
    .sort(
      (a, b) =>
        new Date(b.data_finalizacao_rh || 0) -
        new Date(a.data_finalizacao_rh || 0)
    );
}

/* =====================================================
   ✏️ ATUALIZAR CAMPOS DE AGENDAMENTO (AUTO-SAVE)
===================================================== */
export async function atualizarAgendamentoPorMrh({
  mrh,
  uniformes,
  data_integracao,
  data_admissao,
}) {
  console.info("[SERVICE] atualizarAgendamentoPorMrh", { mrh });

  if (!mrh) {
    throw new Error("MRH não informado.");
  }

  const atualizado = await repo.atualizarAgendamentoPorMrh({
    mrh,
    uniformes: uniformes?.trim() || null,
    data_integracao: data_integracao?.trim() || null,
    data_admissao: data_admissao?.trim() || null,
  });

  if (!atualizado) {
    const err = new Error("MRH não localizado no sistema.");
    err.code = "MRH_NAO_LOCALIZADO";
    throw err;
  }

  return atualizado;
}

/* =====================================================
   ✏️ ATUALIZAR EXAME (mantido por compatibilidade)
===================================================== */
export async function atualizarExamePorMrh({ mrh, exame }) {
  console.info("[SERVICE] atualizarExamePorMrh", { mrh });

  if (!mrh) throw new Error("MRH não informado.");

  const valor = exame?.trim() || null;

  const atualizado = await repo.atualizarExamePorMrh({
    mrh,
    exame: valor,
  });

  if (!atualizado) {
    const err = new Error("MRH não localizado no sistema.");
    err.code = "MRH_NAO_LOCALIZADO";
    throw err;
  }

  return valor;
}
