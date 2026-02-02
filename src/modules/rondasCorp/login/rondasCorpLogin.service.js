import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../../../config/env.js";
import repository from "./rondasCorpLogin.repository.js";

class RondasCorpLoginService {
  /**
   * Login da aplicação Rondas Corp
   * - NÃO recebe CR
   * - NÃO retorna dados do usuário
   * - CR é obtido do banco
   */
  async login({ email, senha }) {
    const erroLogin = "Credenciais inválidas";

    // 1️⃣ Buscar usuário SOMENTE pelo email
    const usuario = await repository.findByEmail(email);

    if (!usuario || !usuario.ativo) {
      throw new Error(erroLogin);
    }

    // 2️⃣ Validar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new Error(erroLogin);
    }

    // 3️⃣ Atualizar último login
    await repository.updateLastLogin(usuario.id);

    // 4️⃣ Gerar token JWT (CR vem do banco)
    const token = jwt.sign(
      {
        id: usuario.id,
        app: "RONDAS_CORP",
        cr: usuario.cr,
      },
      env.JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    // 5️⃣ Retornar SOMENTE o token
    return { token };
  }

  /**
   * Registro de usuário da aplicação Rondas Corp
   * - CR é definido AQUI e salvo no banco
   */
  async registrar({ nome, email, senha, cr }) {
    // 1️⃣ Verificar duplicidade por email
    const existente = await repository.findByEmail(email);
    if (existente) {
      throw new Error("Usuário já cadastrado");
    }

    // 2️⃣ Gerar hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // 3️⃣ Criar usuário
    await repository.createUser({
      nome,
      email,
      senhaHash,
      cr,
    });

    // 4️⃣ Não retornar dados sensíveis
    return {
      sucesso: true,
    };
  }
}

export default new RondasCorpLoginService();
