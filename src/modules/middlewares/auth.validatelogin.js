export function validateLogin(req, res, next) {
  if (!req.body) {
    console.warn("[VALIDATE LOGIN] Corpo da requisição ausente ou inválido");
    return res.status(400).json({
      sucesso: false,
      mensagem:
        "Requisição inválida: corpo da requisição ausente ou JSON inválido.",
    });
  }

  const { email, senha } = req.body;

  if (!email) {
    console.warn("[VALIDATE LOGIN] Campo 'email' ausente");
    return res.status(400).json({
      sucesso: false,
      mensagem: "O campo 'email' é obrigatório.",
    });
  }

  if (!senha) {
    console.warn("[VALIDATE LOGIN] Campo 'senha' ausente");
    return res.status(400).json({
      sucesso: false,
      mensagem: "O campo 'senha' é obrigatório.",
    });
  }
  next();
}
