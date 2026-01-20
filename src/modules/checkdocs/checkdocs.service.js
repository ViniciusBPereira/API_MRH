import repo from "./checkdocs.repository.js";

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

/* -----------------------------------------------------
 * LISTAR CHECKLIST
 * ----------------------------------------------------- */
export async function listarChecklistService(idCandidato) {
  console.log("[SERVICE] listarChecklistService → idCandidato:", idCandidato);

  try {
    const itens = await repo.getByCandidato(idCandidato);

    console.log("[SERVICE] listarChecklistService → retorno repo:", itens);

    const mapeado = itens.map((item) => ({
      id: item.id,
      nome: capitalize(item.nome),
      checked: item.concluido,
      ordem: item.ordem,
    }));

    console.log("[SERVICE] listarChecklistService → mapeado:", mapeado);

    return mapeado;
  } catch (error) {
    console.error("[SERVICE ERROR] listarChecklistService:", error);
    throw error;
  }
}

/* -----------------------------------------------------
 * CRIAR ITEM
 * ----------------------------------------------------- */
export async function criarItemChecklistService(idCandidato, data) {
  console.log("[SERVICE] criarItemChecklistService →", {
    idCandidato,
    data,
  });

  if (!data?.nome) {
    throw new Error("Nome do documento é obrigatório.");
  }

  try {
    const criado = await repo.create({
      id_candidato: idCandidato,
      nome: data.nome,
      ordem: data.ordem ?? null,
    });

    console.log("[SERVICE] criarItemChecklistService → criado:", criado);

    return {
      sucesso: true,
      item: {
        id: criado.id,
        nome: capitalize(criado.nome),
        checked: criado.concluido,
        ordem: criado.ordem,
      },
    };
  } catch (error) {
    console.error("[SERVICE ERROR] criarItemChecklistService:", error);
    throw error;
  }
}

/* -----------------------------------------------------
 * ATUALIZAR CHECK
 * ----------------------------------------------------- */
export async function atualizarCheckChecklistService(idItem, checked) {
  console.log("[SERVICE] atualizarCheckChecklistService →", {
    idItem,
    checked,
  });

  try {
    const atualizado = await repo.updateCheck(idItem, !!checked);

    console.log(
      "[SERVICE] atualizarCheckChecklistService → atualizado:",
      atualizado
    );

    return {
      sucesso: true,
      item: {
        id: atualizado.id,
        checked: atualizado.concluido,
      },
    };
  } catch (error) {
    console.error("[SERVICE ERROR] atualizarCheckChecklistService:", error);
    throw error;
  }
}

/* -----------------------------------------------------
 * ATUALIZAR ITEM
 * ----------------------------------------------------- */
export async function atualizarItemChecklistService(idItem, data) {
  console.log("[SERVICE] atualizarItemChecklistService →", {
    idItem,
    data,
  });

  try {
    const atualizado = await repo.update(idItem, {
      nome: data.nome,
      ordem: data.ordem,
    });

    console.log(
      "[SERVICE] atualizarItemChecklistService → atualizado:",
      atualizado
    );

    return {
      sucesso: true,
      item: {
        id: atualizado.id,
        nome: capitalize(atualizado.nome),
        checked: atualizado.concluido,
        ordem: atualizado.ordem,
      },
    };
  } catch (error) {
    console.error("[SERVICE ERROR] atualizarItemChecklistService:", error);
    throw error;
  }
}

/* -----------------------------------------------------
 * REMOVER ITEM
 * ----------------------------------------------------- */
export async function removerItemChecklistService(idItem) {
  console.log("[SERVICE] removerItemChecklistService → idItem:", idItem);

  try {
    await repo.delete(idItem);
    console.log("[SERVICE] removerItemChecklistService → OK");

    return { sucesso: true };
  } catch (error) {
    console.error("[SERVICE ERROR] removerItemChecklistService:", error);
    throw error;
  }
}

/* -----------------------------------------------------
 * RESUMO (GRID)
 * ----------------------------------------------------- */
export async function resumoChecklistService(idCandidato) {
  console.log("[SERVICE] resumoChecklistService → idCandidato:", idCandidato);

  try {
    const itens = await repo.getByCandidato(idCandidato);

    console.log("[SERVICE] resumoChecklistService → itens:", itens);

    const total = itens.length;
    const concluidos = itens.filter((i) => i.concluido).length;

    const resumo = {
      total_itens: total,
      total_concluidos: concluidos,
      percentual: total === 0 ? 0 : Math.round((concluidos / total) * 100),
    };

    console.log("[SERVICE] resumoChecklistService → resumo:", resumo);

    return resumo;
  } catch (error) {
    console.error("[SERVICE ERROR] resumoChecklistService:", error);
    throw error;
  }
}
