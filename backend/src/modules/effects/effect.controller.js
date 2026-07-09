const asyncHandler = require("../../utils/asyncHandler");

class EffectController {
  constructor(effectService) {
    this.effectService = effectService;
  }

  getEffects = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.effectService.getActiveEffects(req.user),
    });
  });

  getFavoriteEffects = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.effectService.getFavoriteEffects(req.user.id),
    });
  });

  getAdminEffects = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.effectService.getAllEffects(),
    });
  });

  createEffect = asyncHandler(async (req, res) => {
    const effect = await this.effectService.createEffect(req.body, req.user);

    res.status(201).json({
      success: true,
      data: effect,
    });
  });

  updateEffect = asyncHandler(async (req, res) => {
    const effect = await this.effectService.updateEffect(req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      data: effect,
    });
  });

  getPromptVersions = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.effectService.getPromptVersions(req.params.id),
    });
  });

  setFavorite = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.effectService.setFavorite(
        req.user.id,
        req.params.id,
        req.body.isFavorite !== false
      ),
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
