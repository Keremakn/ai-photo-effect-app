const { randomUUID } = require("crypto");
const ApiError = require("../../utils/ApiError");

class EffectService {
  constructor(effectRepository) {
    this.effectRepository = effectRepository;
  }

  async getActiveEffects() {
    const effects = await this.effectRepository.findActive();
    return effects.map(this.toPublicEffect);
  }

  async getAllEffects() {
    return this.effectRepository.findAll();
  }

  async createEffect(payload) {
    this.validateEffectPayload(payload);

    const id = payload.id || randomUUID();

    if (await this.effectRepository.findById(id)) {
      throw new ApiError(409, "Effect id already exists.");
    }

    return this.effectRepository.create({
      id,
      name: payload.name,
      description: payload.description || "",
      prompt: payload.prompt,
      isActive: payload.isActive !== false,
    });
  }

  async updateEffect(id, payload) {
    const updatedEffect = await this.effectRepository.update(id, {
      name: payload.name,
      description: payload.description,
      prompt: payload.prompt,
      isActive: payload.isActive,
    });

    if (!updatedEffect) {
      throw new ApiError(404, "Effect not found.");
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

  toPublicEffect(effect) {
    return {
      id: effect.id,
      name: effect.name,
      description: effect.description,
      isActive: effect.isActive,
    };
  }
}

module.exports = EffectService;
