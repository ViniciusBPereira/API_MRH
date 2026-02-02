import jwt from "jsonwebtoken";
import env from "../../../config/env.js";

export function authRondasCorp(req, res, next) {
  console.log("🛡️ AUTH RONDAS | HIT", {
    method: req.method,
    path: req.originalUrl,
  });

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token da Rondas Corp não fornecido",
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: "Formato de token inválido",
    });
  }

  const token = parts[1];

  try {
    // 🔎 DEBUG CRÍTICO (não quebra segurança)
    const decodedUnsafe = jwt.decode(token);
    console.log("🔍 TOKEN DECODE (SEM VERIFY):", decodedUnsafe);

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (decoded.app !== "RONDAS_CORP") {
      return res.status(403).json({
        message: "Token não pertence à aplicação Rondas Corp",
      });
    }

    if (!decoded.cr) {
      return res.status(403).json({
        message: "CR não informado no token",
      });
    }

    req.user = {
      id: decoded.id,
      cr: decoded.cr,
    };

    console.log("✅ AUTH RONDAS | OK", req.user);
    next();
  } catch (err) {
    console.error("❌ AUTH RONDAS | JWT ERROR:", err.message);
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}
