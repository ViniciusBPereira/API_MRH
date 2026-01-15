import multer from "multer";
import path from "path";
import fs from "fs";

/* -------------------------------------------------------
   📁 DEFINIÇÃO DO PATH E CRIAÇÃO SEGURA DA PASTA
------------------------------------------------------- */
const storagePath = path.resolve("uploads/candidatos");

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

/* -------------------------------------------------------
   🔒 TIPOS DE ARQUIVO PERMITIDOS
------------------------------------------------------- */
const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Tipo de arquivo não permitido. Envie PDF, PNG, JPG, JPEG, DOC ou DOCX."
      )
    );
  }

  cb(null, true);
}

/* -------------------------------------------------------
   🗂️ STORAGE – DISK (ajustado)
------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storagePath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // remove espaços, acentos e caracteres estranhos
    const baseName = file.originalname
      .replace(ext, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const finalName = `${Date.now()}_${baseName}${ext}`;
    cb(null, finalName);
  },
});

/* -------------------------------------------------------
   📦 MULTER EXPORTADO (10MB máx + filtro + erros protegidos)
------------------------------------------------------- */
export const uploadDocs = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});
