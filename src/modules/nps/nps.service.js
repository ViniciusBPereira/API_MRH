import axios from "axios";

/**
 * URL base da API
 */
const BASE_URL = "https://ws.gps360.com.br/aplicacaoPesquisas";

/**
 * Token Bearer (ideal: mover para ENV depois)
 */
const TOKEN = process.env.GPS360_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzU3NTA4MjQsImV4cCI6MTc3NTgzNzIyNCwic3ViIjoiMjNjZTI1NjYtZDg5YS00M2VkLTlhM2YtMTExNTA4NTJmODdmOkdQUzpBbmFsaXN0YTpnYWJyaWVsbGkuc2lsdmFAZ3Bzc2EuY29tLmJyIn0.YHoMZiLp41_NaH4LMS_1YxF3udFHY6tFp0PDJ4OTS_U";

/**
 * Lista de analistas (sem domínio, conforme API exige)
 */
const ANALISTAS = [
  "rayane_cristini",
  "gabrielli.silva",
  "yasmin_vieira",
  "kamila.vitoria"
];

/**
 * Função principal para buscar NPS de todos os analistas
 */
export async function buscarNPS() {
  try {
    console.log("[NPS SERVICE] Buscando NPS dos analistas...");

    const requests = ANALISTAS.map((analista) =>
      axios.get(BASE_URL, {
        params: {
          status: "respondida",
          vinculado_por_email: analista
        },
        headers: {
          Authorization: `Bearer ${TOKEN}`
        },
        timeout: 10000
      })
    );

    const responses = await Promise.all(requests);

    /**
     * Junta todos os resultados em um único array
     */
    const dadosBrutos = responses.flatMap((res) => res.data);

    /**
     * Normalização (IMPORTANTE)
     * Ajuste os campos conforme retorno real da API
     */
    const dadosNormalizados = dadosBrutos.flatMap((wrapper) => {
  const lista = wrapper.aplicacaoPesquisas || [];

  return lista.map((item) => {
    const respostaNPS = item.respostas?.find(r =>
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

      vinculado_por: item.usuarioPesquisa?.criado_por?.email || null,
      enviado_por: item.enviado_por || "Automático",

      respondido_por: item.respondido_por?.email || null,

      nota: nota
    };
  });
});

    console.log(`[NPS SERVICE] Total coletado: ${dadosNormalizados.length}`);

    return dadosNormalizados;

  } catch (error) {
    console.error("[NPS SERVICE] Erro ao buscar NPS:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }

    return [];
  }
}