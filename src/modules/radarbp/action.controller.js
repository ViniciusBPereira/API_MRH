import fs from "fs";
import path from "path";
import actionService from "./action.service.js";

/* =====================================================
   📄 GET /actions
===================================================== */
export async function getActions(req, res) {
  try {
    const actions = await actionService.getAll();

    return res.status(200).json(actions);
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
    const files =
      req.files?.map((file) => ({
        id: crypto.randomUUID(),
        name: file.filename,
        originalName: file.originalname,
        path: `/uploads/actions/${file.filename}`,
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
   ✏️ PUT /actions/:id
===================================================== */
export async function updateAction(req, res) {
  try {
    const { id } = req.params;

    const files = req.files?.map((file) => ({
      id: crypto.randomUUID(),
      name: file.filename,
      originalName: file.originalname,
      path: `/uploads/actions/${file.filename}`,
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

/* =====================================================
   📂 GET /actions/:id/files
===================================================== */
export async function getFiles(req, res) {
  console.log("CHEGOU GET FILES");
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
   📥 GET /actions/:id/files/:fileId
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
   ➕ POST /actions/:id/files
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
        path: `/uploads/actions/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString(),
      });
    }

    const files = await actionService.getFiles(id);

    return res.status(200).json(files);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

/* =====================================================
   🗑 DELETE /actions/:id/files/:fileId
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