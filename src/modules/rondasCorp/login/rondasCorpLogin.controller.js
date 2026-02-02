import service from "./rondasCorpLogin.service.js";

/**
 * POST /api/rondas/login
 * Login da aplicação Rondas Corp
 * - email + senha
 * - retorna SOMENTE token
 */
export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios",
      });
    }

    const { token } = await service.login({
      email,
      senha,
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error("[RONDAS_CORP][LOGIN]", error.message);

    return res.status(401).json({
      error: error.message || "Credenciais inválidas",
    });
  }
}

/**
 * POST /api/rondas/login/registrar
 * Registro de usuário da aplicação Rondas Corp
 * - CR definido SOMENTE aqui
 */
export async function registrar(req, res) {
  try {
    const { nome, email, senha, cr } = req.body;

    if (!nome || !email || !senha || !cr) {
      return res.status(400).json({
        error: "Nome, email, senha e CR são obrigatórios",
      });
    }

    await service.registrar({
      nome,
      email,
      senha,
      cr,
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso",
    });
  } catch (error) {
    console.error("[RONDAS_CORP][REGISTRO]", error.message);

    return res.status(400).json({
      error: error.message || "Erro ao registrar usuário",
    });
  }
}
