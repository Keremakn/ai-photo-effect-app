const express = require("express");
const authRepository = require("./auth.repository");
const AuthService = require("./auth.service");
const AuthController = require("./auth.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { loginLimiter } = require("../../middlewares/rateLimit.middleware");

const router = express.Router();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post("/auth/login", loginLimiter, authController.login);
router.get("/auth/me", requireAuth, authController.me);

module.exports = router;
