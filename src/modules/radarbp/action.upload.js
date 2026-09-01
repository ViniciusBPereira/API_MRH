import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

/* =====================================================
   📂 PASTA DE UPLOADS
===================================================== */

const pasta = "uploads/action-plans";

fs.mkdirSync(pasta, { recursive: true });

/* =====================================================
   💾 STORAGE
===================================================== */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, pasta);
  },

  filename(req, file, cb) {
    const nome = crypto.randomUUID() + path.extname(file.originalname);

    cb(null, nome);
  },
});

/* =====================================================
   📤 UPLOAD
===================================================== */

export const uploadActionPlans = multer({
  storage,
});
