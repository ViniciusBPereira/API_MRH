import express from "express";
import AuthController from "./auth.controller.js";
import { validateLogin } from "../middlewares/auth.validatelogin.js";
import { validateRegister } from "../middlewares/auth.validateregister.js";

const router = express.Router();

// Login com validação
router.post("/login", validateLogin, (req, res) =>
  AuthController.login(req, res)
);

// Cadastro com middleware de validação + código secreto
router.post("/register", validateRegister, (req, res) =>
  AuthController.register(req, res)
);

export default router;
