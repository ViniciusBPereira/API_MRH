import jwt from "jsonwebtoken";
import env from "../../config/env.js";

/**
 * Middleware de autenticação JWT
 *
 * Responsabilidades:
 * - Validar presença do token
 * - Validar assinatura e expiração
 * - Normalizar req.user para o padrão do sistema
 *
 * Após este middleware, SEMPRE haverá:
 *   req.user = { id, email, perfil }
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  // Esperado: "Bearer <token>"
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Token malformado" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 🔒 Normalização do usuário (padrão único do backend)
    req.user = {
      id: decoded.id ?? decoded.userId ?? decoded.sub,
      email: decoded.email ?? null,
      perfil: decoded.perfil ?? null,
    };

    if (!req.user.id) {
      return res
        .status(401)
        .json({ message: "Token válido, mas usuário inválido" });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}
