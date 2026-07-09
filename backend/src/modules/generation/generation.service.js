const { randomUUID } = require("crypto");
const ApiError = require("../../utils/ApiError");

class GenerationService {
  constructor({ effectRepository, generationRepository, aiProvider, storageProvider }) {
    this.effectRepository = effectRepository;
    this.generationRepository = generationRepository;
    this.aiProvider = aiProvider;
    this.storageProvider = storageProvider;
  }

  async getGenerations(pagination) {
    const [rows, total] = await Promise.all([
      this.generationRepository.findAll(pagination),
      this.generationRepository.countAll(),
    ]);

    return { rows, total };
  }

  async getGenerationsForUser(userId, pagination, filters = {}) {
    const [rows, total] = await Promise.all([
      this.generationRepository.findByUserId(userId, {
        ...pagination,
        favoritesOnly: filters.favoritesOnly,
      }),
      this.generationRepository.countByUserId(userId, {
        favoritesOnly: filters.favoritesOnly,
      }),
    ]);

    return { rows, total };
  }

  async generate({ imageFile, effectId, user }) {
    if (!imageFile) {
      throw new ApiError(400, "Image file is required.");
    }

    if (!effectId) {
      throw new ApiError(400, "effectId is required.");
    }

    const effect = await this.effectRepository.findById(effectId);

    if (!effect) {
      throw new ApiError(404, "Effect not found.");
    }

    if (!effect.isActive) {
      throw new ApiError(403, "Effect is not active.");
    }

    const promptVersion = await this.effectRepository.findLatestPromptVersion(effect.id);
    const inputImageUrl = this.storageProvider.getPublicUrl(imageFile);
    const aiResult = await this.aiProvider.generate({
      imagePath: imageFile.path,
      imageUrl: inputImageUrl,
      mimeType: imageFile.mimetype,
      prompt: effect.prompt,
      effect,
    });

    const generation = await this.generationRepository.create({
      id: randomUUID(),
      userId: user?.id || null,
      effectId: effect.id,
      effectName: effect.name,
      promptVersionId: promptVersion?.id || null,
      promptText: effect.prompt,
      inputImageUrl,
      resultImageUrl: aiResult.resultImageUrl,
      provider: aiResult.provider,
      createdAt: new Date().toISOString(),
    });

    return generation;
  }

  async setFavorite(userId, generationId, isFavorite) {
    await this.generationRepository.setFavorite(userId, generationId, isFavorite);
    return { generationId, isFavorite };
  }

  async getDashboardStats() {
    return this.generationRepository.getDashboardStats();
  }
}

module.exports = GenerationService;
