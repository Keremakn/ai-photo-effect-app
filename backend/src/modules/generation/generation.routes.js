const express = require("express");
const upload = require("../../middlewares/upload.middleware");
const { optionalAuth, requireAuth, requireAdmin } = require("../../middlewares/auth.middleware");
const { generateLimiter } = require("../../middlewares/rateLimit.middleware");
const createAIProvider = require("../../services/ai/ai.provider");
const createStorageProvider = require("../../services/storage/storage.provider");
const effectRepository = require("../effects/effect.repository");
const generationRepository = require("./generation.repository");
const GenerationService = require("./generation.service");
const GenerationController = require("./generation.controller");

const router = express.Router();
const generationService = new GenerationService({
  effectRepository,
  generationRepository,
  aiProvider: createAIProvider(),
  storageProvider: createStorageProvider(),
});
const generationController = new GenerationController(generationService);

router.get("/generations/me", requireAuth, generationController.getMyGenerations);
router.get("/generations", requireAuth, requireAdmin, generationController.getGenerations);
router.get("/admin/generations", requireAuth, requireAdmin, generationController.getGenerations);
router.post("/generate", generateLimiter, optionalAuth, upload.single("image"), generationController.generate);

module.exports = router;
