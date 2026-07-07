const express = require("express");
const effectRepository = require("./effect.repository");
const EffectService = require("./effect.service");
const EffectController = require("./effect.controller");

const router = express.Router();
const effectService = new EffectService(effectRepository);
const effectController = new EffectController(effectService);

router.get("/effects", effectController.getEffects);
router.get("/admin/effects", effectController.getAdminEffects);
router.post("/admin/effects", effectController.createEffect);
router.put("/admin/effects/:id", effectController.updateEffect);
router.delete("/admin/effects/:id", effectController.deleteEffect);

module.exports = router;
