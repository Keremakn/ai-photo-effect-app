const express = require("express");
const authRepository = require("./auth.repository");
const AuthService = require("./auth.service");
const AuthController = require("./auth.controller");
const { requireAuth, requireAdmin } = require("../../middlewares/auth.middleware");
const { loginLimiter } = require("../../middlewares/rateLimit.middleware");

const router = express.Router();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post("/auth/login", loginLimiter, authController.login);
router.post("/auth/register", authController.register);
router.get("/auth/me", requireAuth, authController.me);
router.get("/admin/users", requireAuth, requireAdmin, authController.getUsers);
router.get("/admin/users/:id", requireAuth, requireAdmin, authController.getUserDetail);
router.put("/admin/users/:id/role", requireAuth, requireAdmin, authController.updateUserRole);

module.exports = router;
