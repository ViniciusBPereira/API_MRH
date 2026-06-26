import trackingService from "./tracking.service.js";

/* =====================================================
   📄 GET /tracking
===================================================== */
export async function getTracking(req, res) {
  try {
    const tracking = await trackingService.getAll();

    return res.status(200).json(tracking);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar acompanhamentos.",
    });
  }
}

/* =====================================================
   📄 GET /tracking/:id
===================================================== */
export async function getTrackingById(req, res) {
  try {
    const { id } = req.params;

    const tracking = await trackingService.getById(id);

    return res.status(200).json(tracking);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

/* =====================================================
   📄 GET /tracking/contract/:contract
===================================================== */
export async function getTrackingByContract(req, res) {
  try {
    const { contract } = req.params;

    const tracking = await trackingService.getByContract(contract);

    return res.status(200).json(tracking);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar acompanhamento.",
    });
  }
}

/* =====================================================
   ➕ POST /tracking
===================================================== */
export async function createTracking(req, res) {
  try {
    const created = await trackingService.create(req.body);

    return res.status(201).json(created);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

/* =====================================================
   ✏️ PUT /tracking/:id
===================================================== */
export async function updateTracking(req, res) {
  try {
    const { id } = req.params;

    const updated = await trackingService.update(id, req.body);

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

/* =====================================================
   🗑 DELETE /tracking/:id
===================================================== */
export async function deleteTracking(req, res) {
  try {
    const { id } = req.params;

    const deleted = await trackingService.delete(id);

    return res.status(200).json(deleted);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}
