const { randomUUID } = require("crypto");

class GenerationService {
  constructor({ effectRepository, generationRepository, aiProvider, storageProvider }) {
    this.effectRepository = effectRepository;
    this.generationRepository = generationRepository;
    this.aiProvider = aiProvider;
    this.storageProvider = storageProvider;
  }

  getGenerations() {
    return this.generationRepository.findAll();
  }

  async generate({ imageFile, effectId }) {
    if (!imageFile) {
      const error = new Error("Image file is required.");
      error.statusCode = 400;
      throw error;
    }

    if (!effectId) {
      const error = new Error("effectId is required.");
      error.statusCode = 400;
      throw error;
    }

    const effect = this.effectRepository.findById(effectId);

    if (!effect || !effect.isActive) {
      const error = new Error("Effect not found.");
      error.statusCode = 404;
      throw error;
    }

    const inputImageUrl = this.storageProvider.getPublicUrl(imageFile);
    const aiResult = await this.aiProvider.generate({
      imagePath: imageFile.path,
      imageUrl: inputImageUrl,
      mimeType: imageFile.mimetype,
      prompt: effect.prompt,
      effect,
    });

    const generation = this.generationRepository.create({
      id: randomUUID(),
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
