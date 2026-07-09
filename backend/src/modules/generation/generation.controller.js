const asyncHandler = require("../../utils/asyncHandler");

class GenerationController {
  constructor(generationService) {
    this.generationService = generationService;
  }

  getGenerations = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.generationService.getGenerations(),
    });
  });

  generate = asyncHandler(async (req, res) => {
    const generation = await this.generationService.generate({
      imageFile: req.file,
      effectId: req.body.effectId,
    });

    res.status(201).json({
      success: true,
      data: {
        resultImageUrl: generation.resultImageUrl,
        generationId: generation.id,
      },
    });
  });
}

module.exports = GenerationController;
