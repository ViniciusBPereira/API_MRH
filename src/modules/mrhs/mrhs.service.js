import axios from "axios";
import * as repo from "./mrhs.repository.js";
import env from "../../config/env.js";

/**
 * Cache simples em memória para endereços por CR
 */
const enderecoCRCache = new Map();

/**
 * Busca endereço do CR na API SRH
 */
async function buscarEnderecoCR(cr) {
  if (!cr) return null;

  // Cache
  if (enderecoCRCache.has(cr)) {
    return enderecoCRCache.get(cr);
  }

  try {
    const response = await axios.get(
      "https://portalws.gpssa.com.br/SRH_API/api/CentroCusto/BuscarEnderecosCR",
      {
        params: {
          CR: cr,
          page: 1,
          start: 0,
          limit: 1,
        },
        headers: {
          authorization: env.API_TOKEN,
        },
        timeout: 15000,
      }
    );

    const endereco = response.data?.data?.[0];
    if (!endereco) {
      enderecoCRCache.set(cr, null);
      return null;
    }

    const enderecoFormatado = [
      endereco.logradouro,
      endereco.numero,
      endereco.bairro,
      endereco.cidade,
      endereco.uf,
      `CEP: ${endereco.cep}`,
    ]
      .filter(Boolean)
      .join(", ");

    enderecoCRCache.set(cr, enderecoFormatado);
    return enderecoFormatado;
  } catch (err) {
    console.error(`[SERVICE] Erro ao buscar endereço do CR ${cr}`);
    console.error(err.message);
    enderecoCRCache.set(cr, null);
    return null;
  }
}

/**
 * Sincroniza MRHs com a API externa
 */
export async function sincronizarMRHs() {
  console.log("[SERVICE] Buscando MRHs abertas na API externa...");

  try {
    const body = {
      TPA: "",
      CP: "0",
      SD: "",
      SA: "",
      FD: "",
      RS: "0",
      FA: "",
      Where: "",
      UserId: "21803",
      Cpf: null,
      page: 1,
    };

    const response = await axios.post(
      "https://portalws.gpssa.com.br/SRH_API/api/Admissao/BuscarAbertas",
      body,
      {
        headers: {
          authorization: env.API_TOKEN,
        },
        timeout: 30000,
      }
    );

    const mrhs = response.data || [];
    console.log(`[SERVICE] Recebidos ${mrhs.length} registros.`);

    // AD_IDs vindos da API
    const adIdsApi = mrhs.map((m) => m.AD_ID);

    // AD_IDs atualmente abertos no banco
    const adIdsBanco = await repo.getAdIdsAbertos();

    let inseridos = 0;
    let atualizados = 0;

    for (const item of mrhs) {
      // 🔹 Enriquecimento com endereço do CR
      if (item.CR && (!item.AD_ENDERECO || item.AD_ENDERECO === "0")) {
        const enderecoCR = await buscarEnderecoCR(item.CR);
        if (enderecoCR) {
          item.AD_ENDERECO = enderecoCR;
        }
      }

      const existe = await repo.existsByAdId(item.AD_ID);

      if (!existe) {
        await repo.insertMRH({
          ...item,
          encerrado: false,
        });
        inseridos++;
      } else {
        await repo.updateByAdId(item.AD_ID, {
          ...item,
          encerrado: false,
        });
        atualizados++;
      }
    }

    // MRHs que estavam no banco mas não vieram mais da API
    const encerradas = adIdsBanco.filter((id) => !adIdsApi.includes(id));

    await repo.marcarEncerradas(encerradas);

    console.log(
      `[SERVICE] Finalizado: +${inseridos} inseridos, ${atualizados} atualizados, ${encerradas.length} encerrados`
    );
  } catch (error) {
    console.error("[SERVICE] ERRO NA SINCRONIZAÇÃO MRH");
    console.error(error);
  }
}
