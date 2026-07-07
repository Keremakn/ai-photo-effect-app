class EffectController {
  constructor(effectService) {
    this.effectService = effectService;
  }

  getEffects = (req, res, next) => {
    try {
      res.json({
        success: true,
        data: this.effectService.getActiveEffects(),
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminEffects = (req, res, next) => {
    try {
      res.json({
        success: true,
        data: this.effectService.getAllEffects(),
      });
    } catch (error) {
      next(error);
    }
  };

  createEffect = (req, res, next) => {
    try {
      const effect = this.effectService.createEffect(req.body);

      res.status(201).json({
        success: true,
        data: effect,
      });
    } catch (error) {
      next(error);
    }
  };

  updateEffect = (req, res, next) => {
    try {
      const effect = this.effectService.updateEffect(req.params.id, req.body);

      res.json({
        success: true,
        data: effect,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteEffect = (req, res, next) => {
    try {
      const effect = this.effectService.deleteEffect(req.params.id);

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
