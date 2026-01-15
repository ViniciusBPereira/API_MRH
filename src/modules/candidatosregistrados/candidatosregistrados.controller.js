// api/modules/candidatosregistrados/candidatosregistrados.controller.js

import service from "./candidatosregistrados.service.js";

const candidatosRegistradosController = {
  async listar(req, res) {
    try {
      const lista = await service.listarTodos();
      return res.json(lista);
    } catch (err) {
      console.error("Erro ao listar candidatos:", err);
      return res
        .status(500)
        .json({ erro: "Erro interno ao listar candidatos." });
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ erro: "ID é obrigatório." });
      }

      const removido = await service.excluir(id);

      return res.json({
        mensagem: "Candidato excluído com sucesso.",
        id: removido.id,
      });
    } catch (err) {
      console.error("Erro ao excluir candidato:", err);

      // 🔥 Se o service lançar "Candidato não encontrado."
      if (err.message.includes("não encontrado")) {
        return res.status(404).json({ erro: err.message });
      }

      return res.status(400).json({ erro: err.message });
    }
  },
};

export default candidatosRegistradosController;
