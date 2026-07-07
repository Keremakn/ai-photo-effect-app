class EffectController {
  constructor(effectService) {
    this.effectService = effectService;
  }

  getEffects = async (req, res, next) => {
    try {
      res.json({
        success: true,
        data: await this.effectService.getActiveEffects(),
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminEffects = async (req, res, next) => {
    try {
      res.json({
        success: true,
        data: await this.effectService.getAllEffects(),
      });
    } catch (error) {
      next(error);
    }
  };

  createEffect = async (req, res, next) => {
    try {
      const effect = await this.effectService.createEffect(req.body);

      res.status(201).json({
        success: true,
        data: effect,
      });
    } catch (error) {
      next(error);
    }
  };

  updateEffect = async (req, res, next) => {
    try {
      const effect = await this.effectService.updateEffect(req.params.id, req.body);

      res.json({
        success: true,
        data: effect,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteEffect = async (req, res, next) => {
    try {
      const effect = await this.effectService.deleteEffect(req.params.id);

      res.json({
        success: true,
        data: effect,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = EffectController;
