import fs from "fs";
import path from "path";
import crypto from "crypto";

import punctualActionService from "./punctual-action.service.js";

/* =====================================================
   📄 GET /punctual-actions
===================================================== */
export async function getPunctualActions(req, res) {
  try {
    const actions = await punctualActionService.getAll();

    return res.status(200).json(actions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro ao buscar ações pontuais.",
    });
  }
}

/* =====================================================
   📄 GET /punctual-actions/:id
===================================================== */
export async function getPunctualActionById(req, res) {
  try {
    const { id } = req.params;

    const action = await punctualActionService.getById(id);

    return res.status(200).json(action);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

/* =====================================================
   📄 GET /punctual-actions/contract/:contractId
===================================================== */
export async function getPunctualActionsByContract(req, res) {
  try {
    const { contractId } = req.params;

    const actions = await punctualActionService.getByContract(contractId);

    return res.status(200).json(actions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro ao buscar ações pontuais.",
    });
  }
}

/* =====================================================
   ➕ POST /punctual-actions
===================================================== */
export async function createPunctualAction(req, res) {
  try {
    const files =
      req.files?.map((file) => ({
        id: crypto.randomUUID(),
        name: file.filename,
        originalName: file.originalname,
        path: `/uploads/punctual-actions/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString(),
      })) || [];

    const created = await punctualActionService.create({
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
   ✏️ PUT /punctual-actions/:id
===================================================== */
export async function updatePunctualAction(req, res) {
  try {
    const { id } = req.params;

    const files = req.files?.map((file) => ({
      id: crypto.randomUUID(),
      name: file.filename,
      originalName: file.originalname,
      path: `/uploads/punctual-actions/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
    }));

    const updated = await punctualActionService.update(id, {
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
   🗑 DELETE /punctual-actions/:id
===================================================== */
export async function deletePunctualAction(req, res) {
  try {
    const { id } = req.params;

    const deleted = await punctualActionService.delete(id);

    return res.status(200).json(deleted);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

/* =====================================================
   📂 GET /punctual-actions/:id/files
===================================================== */
export async function getFiles(req, res) {
  try {
    const { id } = req.params;

    const files = await punctualActionService.getFiles(id);

    return res.status(200).json(files);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

/* =====================================================
   📥 GET /punctual-actions/:id/files/:fileId
===================================================== */
export async function downloadFile(req, res) {
  try {
    const { id, fileId } = req.params;

    const file = await punctualActionService.getFile(id, fileId);

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
   ➕ POST /punctual-actions/:id/files
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
      await punctualActionService.addFile(id, {
        id: crypto.randomUUID(),
        name: file.filename,
        originalName: file.originalname,
        path: `/uploads/punctual-actions/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString(),
      });
    }

    const files = await punctualActionService.getFiles(id);

    return res.status(200).json(files);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

/* =====================================================
   🗑 DELETE /punctual-actions/:id/files/:fileId
===================================================== */
export async function deleteFile(req, res) {
  try {
    const { id, fileId } = req.params;

    const file = await punctualActionService.removeFile(id, fileId);

    const filePath = path.join(process.cwd(), file.path);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      message: "Arquivo removido com sucesso.",
    });
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}
