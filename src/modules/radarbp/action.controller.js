import fs from "fs";
import path from "path";
import crypto from "crypto";
import actionService from "./action.service.js";

/* =====================================================
   📄 GET /action-plans
===================================================== */
export async function getActionPlans(req, res) {
  try {
    const actionPlans = await actionService.getAll();

    return res.status(200).json(actionPlans);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro ao buscar planos de ação.",
    });
  }
}

/* =====================================================
   📄 GET /action-plans/:id
===================================================== */
export async function getActionPlanById(req, res) {
  try {
    const { id } = req.params;

    const actionPlan = await actionService.getById(id);

    return res.status(200).json(actionPlan);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

/* =====================================================
   📄 GET /action-plans/contract/:contractId
===================================================== */
export async function getActionPlansByContract(req, res) {
  try {
    const { contractId } = req.params;

    const actionPlans = await actionService.getByContract(contractId);

    return res.status(200).json(actionPlans);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro ao buscar planos de ação.",
    });
  }
}

/* =====================================================
   ➕ POST /action-plans
===================================================== */
export async function createActionPlan(req, res) {
  try {
    const files =
      req.files?.map((file) => ({
        id: crypto.randomUUID(),
        name: file.filename,
        originalName: file.originalname,
        path: `/uploads/action-plans/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString(),
      })) || [];

    const created = await actionService.create({
      ...req.body,
      files,
    });

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
   ✏️ PUT /action-plans/:id
===================================================== */
export async function updateActionPlan(req, res) {
  try {
    const { id } = req.params;

    const files = req.files?.map((file) => ({
      id: crypto.randomUUID(),
      name: file.filename,
      originalName: file.originalname,
      path: `/uploads/action-plans/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
    }));

    const updated = await actionService.update(id, {
      ...req.body,
      ...(files ? { files } : {}),
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

/* =====================================================
   🗑 DELETE /action-plans/:id
===================================================== */
export async function deleteActionPlan(req, res) {
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

/* =====================================================
   📂 GET /action-plans/:id/files
===================================================== */
export async function getFiles(req, res) {
  try {
    const { id } = req.params;

    const files = await actionService.getFiles(id);

    return res.status(200).json(files);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

/* =====================================================
   📥 GET /action-plans/:id/files/:fileId
===================================================== */
export async function downloadFile(req, res) {
  try {
    const { id, fileId } = req.params;

    const file = await actionService.getFile(id, fileId);

    const filePath = path.join(process.cwd(), file.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Arquivo físico não encontrado.",
      });
    }

    return res.download(filePath, file.originalName);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

/* =====================================================
   ➕ POST /action-plans/:id/files
===================================================== */
export async function uploadFiles(req, res) {
  try {
    const { id } = req.params;

    if (!req.files?.length) {
      return res.status(400).json({
        message: "Nenhum arquivo enviado.",
      });
    }

    for (const file of req.files) {
      await actionService.addFile(id, {
        id: crypto.randomUUID(),
        name: file.filename,
        originalName: file.originalname,
        path: `/uploads/action-plans/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString(),
      });
    }

    const files = await actionService.getFiles(id);

    return res.status(200).json(files);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

/* =====================================================
   🗑 DELETE /action-plans/:id/files/:fileId
===================================================== */
export async function deleteFile(req, res) {
  try {
    const { id, fileId } = req.params;

    const file = await actionService.removeFile(id, fileId);

    const filePath = path.join(process.cwd(), file.path);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      message: "Arquivo removido com sucesso.",
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}
