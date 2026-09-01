import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const pasta = "uploads/punctual-actions";

fs.mkdirSync(pasta, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, pasta);
  },

  filename(req, file, cb) {
    const nome = crypto.randomUUID() + path.extname(file.originalname);

    cb(null, nome);
  },
});

export const uploadPunctualActions = multer({
  storage,
});
