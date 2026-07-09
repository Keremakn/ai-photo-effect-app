const asyncHandler = require("../../utils/asyncHandler");

class EffectController {
  constructor(effectService) {
    this.effectService = effectService;
  }

  getEffects = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.effectService.getActiveEffects(),
    });
  });

  getAdminEffects = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.effectService.getAllEffects(),
    });
  });

  createEffect = asyncHandler(async (req, res) => {
    const effect = await this.effectService.createEffect(req.body);

    res.status(201).json({
      success: true,
      data: effect,
    });
  });

  updateEffect = asyncHandler(async (req, res) => {
    const effect = await this.effectService.updateEffect(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: effect,
    });
  });

  deleteEffect = asyncHandler(async (req, res) => {
    const effect = await this.effectService.deleteEffect(req.params.id);

    res.status(200).json({
      success: true,
      data: effect,
    });
  });
}

module.exports = EffectController;
