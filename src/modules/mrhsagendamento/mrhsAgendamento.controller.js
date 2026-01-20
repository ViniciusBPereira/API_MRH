import {
  listarMRHsAgendamento,
  atualizarAgendamentoPorMrh,
  atualizarExamePorMrh,
} from "./mrhsAgendamento.service.js";

/* =====================================================
   📄 GET /mrhsagendamento
   Lista apenas MRHs com etapa = 1
===================================================== */
export async function getMRHsAgendamento(req, res) {
  const controller = "getMRHsAgendamento";

  try {
    const resultado = await listarMRHsAgendamento();
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - erro`, error);
    return res.status(500).json({
      message: "Erro ao buscar MRHs do time de agendamento.",
    });
  }
}

/* =====================================================
   ✏️ PATCH /mrhsagendamento/:mrh
   Auto-save dos campos:
   - uniformes
   - data_integracao
   - data_admissao
===================================================== */
export async function atualizarAgendamento(req, res) {
  const controller = "atualizarAgendamento";

  try {
    const { mrh } = req.params;
    const { uniformes, data_integracao, data_admissao } = req.body;

    const atualizado = await atualizarAgendamentoPorMrh({
      mrh,
      uniformes,
      data_integracao,
      data_admissao,
    });

    return res.status(200).json(atualizado);
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - erro`, error);

    if (error.code === "MRH_NAO_LOCALIZADO") {
      return res.status(404).json({
        message: "MRH não localizada no sistema.",
      });
    }

    return res.status(500).json({
      message: "Erro ao salvar dados de agendamento.",
    });
  }
}

/* =====================================================
   ✏️ PATCH /mrhsagendamento/exame/:mrh
   Mantido por compatibilidade
===================================================== */
export async function atualizarExame(req, res) {
  const controller = "atualizarExame";

  try {
    const { mrh } = req.params;
    const { exame } = req.body;

    const valor = await atualizarExamePorMrh({ mrh, exame });
    return res.status(200).json({ exame: valor });
  } catch (error) {
    console.error(`[CONTROLLER] ${controller} - erro`, error);

    if (error.code === "MRH_NAO_LOCALIZADO") {
      return res.status(404).json({
        message: "MRH não localizada no sistema.",
      });
    }

    return res.status(500).json({
      message: "Erro ao salvar exame.",
    });
  }
}
