import env from "../../config/env.js";

export function validateRegister(req, res, next) {
  const { nome, email, senha, key } = req.body;

  // 1️⃣ Verificar campos obrigatórios
  if (!nome || !email || !senha) {
    console.warn("[VALIDATE REGISTER] Campos obrigatórios ausentes", {
      nome,
      email,
    });
    return res.status(400).json({
      sucesso: false,
      mensagem: "Nome, e-mail e senha são obrigatórios.",
    });
  }
  console.log("[VALIDATE REGISTER] Campos obrigatórios presentes");

  // 2️⃣ Verificar código secreto
  const keyenv = env.REGISTER; // sua key secreta do .env
  if (!key || key !== keyenv) {
    console.warn("[VALIDATE REGISTER] Key inválida ou ausente", { key });
    return res.status(403).json({
      sucesso: false,
      mensagem: "Key inválida!",
    });
  }
  console.log("[VALIDATE REGISTER] Key válida");

  next();
}
