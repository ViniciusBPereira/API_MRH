import { login, register } from "./auth.service.js";

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const resultado = await login(email, senha);

      if (!resultado.sucesso) {
        return res.status(401).json({
          sucesso: false,
          mensagem: "E-mail ou senha inválidos.",
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: "Autenticação realizada com sucesso.",
        token: resultado.token,
        usuario: resultado.usuario,
      });
    } catch (error) {
      console.error("[AUTH CONTROLLER] Erro no login:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno ao realizar autenticação.",
      });
    }
  }

  // Endpoint de cadastro
  async register(req, res) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome, e-mail e senha são obrigatórios.",
        });
      }

      const resultado = await register({ nome, email, senha });
      const statusCode = resultado.sucesso ? 201 : 400;

      return res.status(statusCode).json(resultado);
    } catch (error) {
      console.error("[AUTH CONTROLLER] Erro no cadastro:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno ao cadastrar usuário.",
      });
    }
  }
}

export default new AuthController();
