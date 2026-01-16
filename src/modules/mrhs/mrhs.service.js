import axios from "axios";
import * as repo from "./mrhs.repository.js";
import env from "../../config/env.js";

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
      "https://portalws.gpssa.com.br/SRH_API/api/Admissao/BuscarAbertas?_dc=1763676396616",
      body,
      {
        headers: {
          authorization: env.API_TOKEN,
        },
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
