const { randomUUID } = require("crypto");
const ApiError = require("../../utils/ApiError");

class GenerationService {
  constructor({ effectRepository, generationRepository, aiProvider, storageProvider }) {
    this.effectRepository = effectRepository;
    this.generationRepository = generationRepository;
    this.aiProvider = aiProvider;
    this.storageProvider = storageProvider;
  }

  async getGenerations() {
    return this.generationRepository.findAll();
  }

  async getGenerationsForUser(userId) {
    return this.generationRepository.findByUserId(userId);
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
      inputImageUrl,
      resultImageUrl: aiResult.resultImageUrl,
      provider: aiResult.provider,
      createdAt: new Date().toISOString(),
    });

    return generation;
  }
}

module.exports = GenerationService;
