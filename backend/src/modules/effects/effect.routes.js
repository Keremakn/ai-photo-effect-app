const express = require("express");
const effectRepository = require("./effect.repository");
const EffectService = require("./effect.service");
const EffectController = require("./effect.controller");
const { optionalAuth, requireAuth, requireAdmin } = require("../../middlewares/auth.middleware");

const router = express.Router();
const effectService = new EffectService(effectRepository);
const effectController = new EffectController(effectService);
const adminOnly = [requireAuth, requireAdmin];

router.get("/effects", optionalAuth, effectController.getEffects);
router.get("/effects/favorites", requireAuth, effectController.getFavoriteEffects);
router.put("/effects/:id/favorite", requireAuth, effectController.setFavorite);
router.get("/admin/effects", adminOnly, effectController.getAdminEffects);
router.post("/admin/effects", adminOnly, effectController.createEffect);
router.put("/admin/effects/:id", adminOnly, effectController.updateEffect);
router.delete("/admin/effects/:id", adminOnly, effectController.deleteEffect);
router.get("/admin/effects/:id/prompt-versions", adminOnly, effectController.getPromptVersions);

module.exports = router;
