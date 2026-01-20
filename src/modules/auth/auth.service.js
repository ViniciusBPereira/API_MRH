import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authRepository from "./auth.repository.js";
import env from "../../config/env.js";

export async function login(email, senha) {
  try {
    console.log(`[AUTH SERVICE] Tentativa de login para email: ${email}`);

    // 1. Buscar usuário pelo e-mail
    const usuario = await authRepository.findByEmail(email);

    // ⚠️ Resposta genérica em todos os casos de falha para evitar User Enumeration
    const respostaFalha = {
      sucesso: false,
      mensagem: "E-mail ou senha inválidos.",
    };

    // Usuário não existe OU está inativo → mesma resposta
    if (!usuario || !usuario.ativo) {
      console.log(
        `[AUTH SERVICE] Falha de login: usuário inexistente ou inativo para email: ${email}`
      );
      return respostaFalha;
    }

    // 2. Validar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      console.log(
        `[AUTH SERVICE] Falha de login: senha incorreta para email: ${email}`
      );
      return respostaFalha;
    }

    // 3. Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
      },
      env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 4. Atualizar último login
    await authRepository.updateLastLogin(usuario.id);

    console.log(
      `[AUTH SERVICE] Login bem-sucedido para usuário: ${usuario.nome} (${email})`
    );

    // 5. Retornar dados seguros
    return {
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  } catch (error) {
    console.error("[AUTH SERVICE] Erro inesperado no login:", error);
    return {
      sucesso: false,
      mensagem: "Erro interno ao tentar realizar login.",
    };
  }
}

export async function register({ nome, email, senha }) {
  try {
    console.log(
      `[AUTH SERVICE] Tentativa de registro para email: ${email}, nome: ${nome}`
    );

    // 1️⃣ Verificar se o usuário já existe
    const existente = await authRepository.findByEmail(email);
    if (existente) {
      console.log(
        `[AUTH SERVICE] Falha de registro: email já cadastrado (${email})`
      );
      return { sucesso: false, mensagem: "E-mail já cadastrado." };
    }

    // 2️⃣ Gerar hash da senha
    const senhaHash = await bcrypt.hash(senha, 10); // 10 rounds de salt

    // 3️⃣ Criar usuário no banco
    const usuario = await authRepository.createUser({ nome, email, senhaHash });

    console.log(`[AUTH SERVICE] Registro bem-sucedido: ${nome} (${email})`);

    // 4️⃣ Retornar dados seguros
    return {
      sucesso: true,
      mensagem: "Usuário criado com sucesso.",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  } catch (error) {
    console.error("[AUTH SERVICE] Erro no cadastro:", error);
    return {
      sucesso: false,
      mensagem: "Erro interno ao tentar cadastrar usuário.",
    };
  }
}
