import jwt from "jsonwebtoken";
import env from "../../config/env.js";

/**
 * Middleware de autenticação JWT
 *
 * - 🔓 Ignora rotas públicas: /api/rondas/*
 * - 🔒 Protege todas as demais rotas
 * - Logs completos para diagnóstico
 */
export function authMiddleware(req, res, next) {
  const path = req.path; // ⚠️ path RELATIVO ao mount (/api)

  /* =====================================================
     🔓 ROTAS PÚBLICAS (IGNORAR AUTH)
     /api/rondas/*
  ===================================================== */
  if (path.startsWith("/rondas")) {
    console.log("🔓 AUTH | Rota pública ignorada:", {
      method: req.method,
      path: req.originalUrl,
    });
    return next();
  }

  /* =====================================================
     🔐 ROTAS PROTEGIDAS
  ===================================================== */
  console.log("🔐 AUTH | HIT", {
    method: req.method,
    path: req.originalUrl,
  });

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("❌ AUTH | Authorization header AUSENTE");
    return res.status(401).json({ message: "Token não fornecido" });
  }

  // Esperado: "Bearer <token>"
  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : null;

  if (!token) {
    console.log("❌ AUTH | Header malformado:", authHeader);
    return res.status(401).json({ message: "Token malformado" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 🔒 Normalização do usuário (contrato único do backend)
    req.user = {
      id: decoded.id ?? decoded.userId ?? decoded.sub,
      email: decoded.email ?? null,
      perfil: decoded.perfil ?? null,
    };

    if (!req.user.id) {
      console.log("❌ AUTH | Token válido, mas sem ID", decoded);
      return res
        .status(401)
        .json({ message: "Token válido, mas usuário inválido" });
    }

    console.log("✅ AUTH | Token válido", {
      userId: req.user.id,
      email: req.user.email,
      perfil: req.user.perfil,
    });

    return next();
  } catch (error) {
    console.log("❌ AUTH | Falha ao validar token", error.message);
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}
