import axios from "axios";
import * as repo from "./mrhs.repository.js";
import env from "../../config/env.js";

/**
 * Busca a localidade pelo Centro de Custo
 */
async function buscarLocalidade(centroCusto) {
  try {
    if (!centroCusto) {
      return null;
    }

    const response = await axios.get(
      "https://portalws.gpssa.com.br/SRH_API/api/CentroCusto/BuscarEnderecosCR",
      {
        params: {
          CC: centroCusto,
          page: 1,
          start: 0,
          limit: 25,
        },
        headers: {
          authorization: env.API_TOKEN,
        },
      },
    );

    const localidade = response.data?.[0];

    if (!localidade) {
      return null;
    }

    return {
      nome_local: localidade.ZB_NLOCAL ?? null,
      municipio: localidade.ZB_MUN ?? null,
      estado: localidade.ZB_EST ?? null,
      endereco: localidade.ZB_END ?? null,
      cep: localidade.ZB_CEP ?? null,
      bairro: localidade.ZB_BAIRRO ?? null,
    };
  } catch (error) {
    console.error(`[LOCALIDADE] Erro ao buscar centro de custo ${centroCusto}`);

    console.error(error.message);

    return null;
  }
}

/**
 * EXECUTAR UMA ÚNICA VEZ
 */
async function preencherLocalidadesPendentes() {
  console.log("[LOCALIDADE] Buscando registros sem localidade...");

  try {
    const registros = await repo.getMRHsSemLocalidade();

    console.log(`[LOCALIDADE] ${registros.length} registros encontrados`);

    let atualizados = 0;

    for (const registro of registros) {
      try {
        const localidade = await buscarLocalidade(registro.centro_custo);

        if (!localidade) {
          continue;
        }

        await repo.updateLocalidade(registro.ad_id, localidade);

        atualizados++;

        console.log(
          `[LOCALIDADE] ${atualizados}/${registros.length} - AD_ID ${registro.ad_id}`,
        );
      } catch (error) {
        console.error(`[LOCALIDADE] Erro ao processar AD_ID ${registro.ad_id}`);

        console.error(error.message);
      }
    }

    console.log(
      `[LOCALIDADE] Finalizado. ${atualizados} registros atualizados.`,
    );
  } catch (error) {
    console.error("[LOCALIDADE] Erro ao preencher localidades");

    console.error(error);
  }
}

/**
 * Sincroniza MRHs com a API externa
 */
export async function sincronizarMRHs() {
  console.log("[SERVICE] Buscando MRHs abertas na API externa...");

  try {
    /**
     * ==================================================
     * EXECUTAR UMA ÚNICA VEZ
     * Depois de concluir, REMOVER ou COMENTAR
     * ==================================================
     */
    await preencherLocalidadesPendentes();

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
      "https://portalws.gpssa.com.br/SRH_API/api/Admissao/BuscarAbertas?_dc=1781470620283",
      body,
      {
        headers: {
          authorization: env.API_TOKEN,
        },
      },
    );

    const mrhs = response.data || [];

    console.log(`[SERVICE] Recebidos ${mrhs.length} registros.`);

    const adIdsApi = mrhs.map((m) => m.AD_ID);

    const adIdsBanco = await repo.getAdIdsAbertos();

    let inseridos = 0;
    let atualizados = 0;

    for (const item of mrhs) {
      try {
        const existe = await repo.existsByAdId(item.AD_ID);

        if (!existe) {
          let localidade = null;

          try {
            localidade = await buscarLocalidade(item.CENTRO_CUSTO);
          } catch (err) {
            console.error(
              `[LOCALIDADE] Falha ao buscar localização do AD_ID ${item.AD_ID}`,
            );
          }

          await repo.insertMRH({
            ...item,
            localidade,
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
      } catch (err) {
        console.error(`[SERVICE] Erro ao processar AD_ID ${item.AD_ID}`);

        console.error(err);
      }
    }

    const encerradas = adIdsBanco.filter((id) => !adIdsApi.includes(id));

    await repo.marcarEncerradas(encerradas);

    console.log(
      `[SERVICE] Finalizado: +${inseridos} inseridos, ${atualizados} atualizados, ${encerradas.length} encerrados`,
    );
  } catch (error) {
    console.error("[SERVICE] ERRO NA SINCRONIZAÇÃO MRH");

    console.error(error);
  }
}
