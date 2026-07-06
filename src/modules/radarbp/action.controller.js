import actionService from "./action.service.js";

/* =====================================================
   📄 GET /actions
===================================================== */
export async function getActions(req, res) {
  try {
    const actions = await actionService.getAll();

    return res.status(200).json(actions);
  } catch {
    return res.status(500).json({
      message: "Erro ao buscar ações.",
    });
  }
}

/* =====================================================
   📄 GET /actions/:id
===================================================== */
export async function getActionById(req, res) {
  try {
    const { id } = req.params;

    const action = await actionService.getById(id);

    return res.status(200).json(action);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

/* =====================================================
   📄 GET /actions/visit/:visitId
===================================================== */
export async function getActionsByVisit(req, res) {
  try {
    const { visitId } = req.params;

    const actions = await actionService.getByVisit(visitId);

    return res.status(200).json(actions);
  } catch {
    return res.status(500).json({
      message: "Erro ao buscar ações.",
    });
  }
}

/* =====================================================
   📄 GET /actions/contract/:contract
===================================================== */
export async function getActionsByContract(req, res) {
  try {
    const { contract } = req.params;

    const actions = await actionService.getByContract(contract);

    return res.status(200).json(actions);
  } catch {
    return res.status(500).json({
      message: "Erro ao buscar ações.",
    });
  }
}

/* =====================================================
   ➕ POST /actions
===================================================== */
export async function createAction(req, res) {
  try {
    const created = await actionService.create(req.body);

    return res.status(201).json(created);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
      detail: error.detail,
      routine: error.routine,
      code: error.code,
    });
  }
}

/* =====================================================
   ✏️ PUT /actions/:id
===================================================== */
export async function updateAction(req, res) {
  try {
    const { id } = req.params;

    const updated = await actionService.update(id, req.body);

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

/* =====================================================
   🗑 DELETE /actions/:id
===================================================== */
export async function deleteAction(req, res) {
  try {
    const { id } = req.params;

    const deleted = await actionService.delete(id);

    return res.status(200).json(deleted);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}
