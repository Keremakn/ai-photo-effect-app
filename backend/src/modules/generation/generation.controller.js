const asyncHandler = require("../../utils/asyncHandler");
const { getPagination, paginatedResponse } = require("../../utils/pagination");

class GenerationController {
  constructor(generationService) {
    this.generationService = generationService;
  }

  getGenerations = asyncHandler(async (req, res) => {
    const pagination = getPagination(req.query);
    const result = await this.generationService.getGenerations(pagination);

    res.status(200).json({
      success: true,
      data: paginatedResponse({
        rows: result.rows,
        total: result.total,
        ...pagination,
      }),
    });
  });

  getMyGenerations = asyncHandler(async (req, res) => {
    const pagination = getPagination(req.query);
    const result = await this.generationService.getGenerationsForUser(req.user.id, pagination, {
      favoritesOnly: req.query.favorites === "true",
    });

    res.status(200).json({
      success: true,
      data: paginatedResponse({
        rows: result.rows,
        total: result.total,
        ...pagination,
      }),
    });
  });

  getUserGenerations = asyncHandler(async (req, res) => {
    const pagination = getPagination(req.query);
    const result = await this.generationService.getGenerationsForUser(req.params.userId, pagination);

    res.status(200).json({
      success: true,
      data: paginatedResponse({
        rows: result.rows,
        total: result.total,
        ...pagination,
      }),
    });
  });

  setFavorite = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.generationService.setFavorite(
        req.user.id,
        req.params.id,
        req.body.isFavorite !== false
      ),
    });
  });

  getDashboardStats = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: await this.generationService.getDashboardStats(),
    });
  });

  generate = asyncHandler(async (req, res) => {
    const generation = await this.generationService.generate({
      imageFile: req.file,
      effectId: req.body.effectId,
      user: req.user,
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
