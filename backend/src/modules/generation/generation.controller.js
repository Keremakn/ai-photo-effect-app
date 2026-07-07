class GenerationController {
  constructor(generationService) {
    this.generationService = generationService;
  }

  getGenerations = async (req, res, next) => {
    try {
      res.json({
        success: true,
        data: await this.generationService.getGenerations(),
      });
    } catch (error) {
      next(error);
    }
  };

  generate = async (req, res, next) => {
    try {
      const generation = await this.generationService.generate({
        imageFile: req.file,
        effectId: req.body.effectId,
      });

      res.json({
        success: true,
        data: {
          resultImageUrl: generation.resultImageUrl,
          generationId: generation.id,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = GenerationController;
