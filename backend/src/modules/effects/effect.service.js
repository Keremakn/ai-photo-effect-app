const { randomUUID } = require("crypto");
const ApiError = require("../../utils/ApiError");

class EffectService {
  constructor(effectRepository) {
    this.effectRepository = effectRepository;
  }

  async getActiveEffects(user = null) {
    const effects = await this.effectRepository.findActive(user?.id);
    return effects.map(this.toPublicEffect);
  }

  async getFavoriteEffects(userId) {
    const effects = await this.effectRepository.findFavoriteEffects(userId);
    return effects.map(this.toPublicEffect);
  }

  async getAllEffects() {
    return this.effectRepository.findAll();
  }

  async createEffect(payload, user = null) {
    this.validateEffectPayload(payload);

    const id = payload.id || randomUUID();

    if (await this.effectRepository.findById(id)) {
      throw new ApiError(409, "Effect id already exists.");
    }

    const effect = await this.effectRepository.create({
      id,
      name: payload.name,
      description: payload.description || "",
      category: payload.category || "General",
      tags: this.normalizeTags(payload.tags),
      prompt: payload.prompt,
      isActive: payload.isActive !== false,
    });

    await this.effectRepository.createPromptVersion({
      id: randomUUID(),
      effectId: id,
      prompt: payload.prompt,
      createdBy: user?.id,
    });

    return effect;
  }

  async updateEffect(id, payload, user = null) {
    const currentEffect = await this.effectRepository.findById(id);

    if (!currentEffect) {
      throw new ApiError(404, "Effect not found.");
    }

    const updatedEffect = await this.effectRepository.update(id, {
      name: payload.name,
      description: payload.description,
      prompt: payload.prompt,
      category: payload.category,
      tags: payload.tags !== undefined ? this.normalizeTags(payload.tags) : undefined,
      isActive: payload.isActive,
    });

    if (!updatedEffect) {
      throw new ApiError(404, "Effect not found.");
    }

    if (payload.prompt !== undefined && payload.prompt !== currentEffect.prompt) {
      await this.effectRepository.createPromptVersion({
        id: randomUUID(),
        effectId: id,
        prompt: payload.prompt,
        createdBy: user?.id,
      });
    }

    return updatedEffect;
  }

  async deleteEffect(id) {
    const deletedEffect = await this.effectRepository.delete(id);

    if (!deletedEffect) {
      throw new ApiError(404, "Effect not found.");
    }

    return deletedEffect;
  }

  validateEffectPayload(payload) {
    if (!payload.name || !payload.prompt) {
      throw new ApiError(400, "Effect name and prompt are required.");
    }
  }

  normalizeTags(tags) {
    if (Array.isArray(tags)) {
      return tags.map((tag) => String(tag).trim()).filter(Boolean);
    }

    if (typeof tags === "string") {
      return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    }

    return [];
  }

  toPublicEffect(effect) {
    return {
      id: effect.id,
      name: effect.name,
      description: effect.description,
      category: effect.category,
      tags: effect.tags,
      isActive: effect.isActive,
      isFavorite: effect.isFavorite,
    };
  }

  async getPromptVersions(effectId) {
    if (!await this.effectRepository.findById(effectId)) {
      throw new ApiError(404, "Effect not found.");
    }

    return this.effectRepository.findPromptVersions(effectId);
  }

  async setFavorite(userId, effectId, isFavorite) {
    if (!await this.effectRepository.findById(effectId)) {
      throw new ApiError(404, "Effect not found.");
    }

    await this.effectRepository.setFavorite(userId, effectId, isFavorite);
    return { effectId, isFavorite };
  }
}

module.exports = EffectService;
