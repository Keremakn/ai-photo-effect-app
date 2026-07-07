const express = require("express");
const upload = require("../../middlewares/upload.middleware");
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

router.get("/generations", generationController.getGenerations);
router.post("/generate", upload.single("image"), generationController.generate);

module.exports = router;
