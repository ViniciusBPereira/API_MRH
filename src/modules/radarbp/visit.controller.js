import visitService from "./visit.service.js";

/* =====================================================
   📄 GET /visits
===================================================== */
export async function getVisits(req, res) {
  try {
    const visits = await visitService.getAll();

    return res.status(200).json(visits);
  } catch (error) {
    console.error("[CONTROLLER] getVisits - erro", error);

    return res.status(500).json({
      message: "Erro ao buscar visitas.",
    });
  }
}

/* =====================================================
   📄 GET /visits/:id
===================================================== */
export async function getVisitById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "ID da visita é obrigatório.",
      });
    }

    const visit = await visitService.getById(id);

    return res.status(200).json(visit);
  } catch (error) {
    return res.status(404).json({
      message: error.message || "Visita não encontrada.",
    });
  }
}

/* =====================================================
   📄 GET /visits/pec/:pec
===================================================== */
export async function getVisitsByPec(req, res) {
  try {
    const { pec } = req.params;

    if (!pec) {
      return res.status(400).json({
        message: "PEC é obrigatório.",
      });
    }

    const visits = await visitService.getByPec(pec);

    return res.status(200).json(visits);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar visitas.",
    });
  }
}

/* =====================================================
   ➕ POST /visits
===================================================== */
export async function createVisit(req, res) {
  try {
    const created = await visitService.create(req.body);

    return res.status(201).json(created);
  } catch (error) {
    console.error("[CONTROLLER] createVisit - erro", error);

    return res.status(400).json({
      message: error.message || "Erro ao criar visita.",
    });
  }
}

/* =====================================================
   ✏️ PUT /visits/:id
===================================================== */
export async function updateVisit(req, res) {
  try {
    const { id } = req.params;

    const updated = await visitService.update(id, req.body);

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Erro ao atualizar visita.",
    });
  }
}

/* =====================================================
   🗑 DELETE /visits/:id
===================================================== */
export async function deleteVisit(req, res) {
  try {
    const { id } = req.params;

    const result = await visitService.delete(id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({
      message: error.message || "Erro ao remover visita.",
    });
  }
}