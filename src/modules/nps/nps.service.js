import axios from "axios";

/* ================= CONFIG ================= */
const BASE_URL = "https://ws.gps360.com.br/aplicacaoPesquisas";

const TOKEN =
  process.env.GPS360_TOKEN ||
  "SEU_TOKEN_AQUI";

/* 🔥 PAGINAÇÃO */
const TAKE = 50;

/* ================= ANALISTAS (PREFIXO CORRETO) ================= */
const ANALISTAS = [
  "raya",
  "gabrielli",
  "yasmin",
  "kamila",
];

/* =====================================================
   🔥 BUSCAR TODAS AS PÁGINAS DE UM ANALISTA
===================================================== */
async function buscarPorAnalista(analista) {
  let page = 1;
  let todos = [];

  while (true) {
    console.log(`[NPS] ${analista} → página ${page}`);

    const response = await axios.get(BASE_URL, {
      params: {
        status: "respondida",
        vinculado_por_email: analista,
        page,
        take: TAKE,
      },
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      timeout: 10000,
    });

    /* 🔥 AQUI ESTÁ A CORREÇÃO PRINCIPAL */
    const lista = response.data?.aplicacaoPesquisas || [];

    if (!lista.length) break;

    /* guarda o wrapper completo (pra normalização depois) */
    todos.push(response.data);

    /* 🔥 se veio menos que TAKE → acabou */
    if (lista.length < TAKE) break;

    page++;
  }

  return todos;
}

/* =====================================================
   FUNÇÃO PRINCIPAL
===================================================== */
export async function buscarNPS() {
  try {
    console.log("[NPS SERVICE] Buscando NPS com paginação...");

    /* 🔥 busca todos analistas em paralelo */
    const resultados = await Promise.all(
      ANALISTAS.map((a) => buscarPorAnalista(a))
    );

    const dadosBrutos = resultados.flat();

    /* =====================================================
       NORMALIZAÇÃO
    ===================================================== */
    const dadosNormalizados = dadosBrutos.flatMap((wrapper) => {
      const lista = wrapper.aplicacaoPesquisas || [];

      return lista.map((item) => {
        const respostaNPS = item.respostas?.find((r) =>
          r.pergunta?.includes("0 a 10")
        );

        const nota = respostaNPS?.respostas?.[0] || null;

        return {
          id: item.index,
          status: item.respondida_em ? "Respondida" : "Pendente",
          pesquisa: item.pesquisa?.nome || null,

          enviado_em: item.enviado_em,
          respondido_em: item.respondida_em,

          nome_respondente: item.respondido_por?.name || null,
          email_respondente: item.respondido_por?.email || null,

          unidade_resultado: item.crs?.join(", ") || null,
          grupo_cliente: item.grupo_cliente?.join(", ") || null,

          vinculado_por:
            item.usuarioPesquisa?.criado_por?.email || null,

          enviado_por: item.enviado_por || "Automático",
          respondido_por: item.respondido_por?.email || null,

          nota: nota,
        };
      });
    });

    console.log(
      `[NPS SERVICE] Total coletado: ${dadosNormalizados.length}`
    );

    return dadosNormalizados;
  } catch (error) {
    console.error("[NPS SERVICE] Erro:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }

    return [];
  }
}