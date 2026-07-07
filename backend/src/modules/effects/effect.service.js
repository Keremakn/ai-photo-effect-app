const { randomUUID } = require("crypto");

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
      const error = new Error("Effect id already exists.");
      error.statusCode = 409;
      throw error;
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
      const error = new Error("Effect not found.");
      error.statusCode = 404;
      throw error;
    }

    return updatedEffect;
  }

  async deleteEffect(id) {
    const deletedEffect = await this.effectRepository.delete(id);

    if (!deletedEffect) {
      const error = new Error("Effect not found.");
      error.statusCode = 404;
      throw error;
    }

    return deletedEffect;
  }

  validateEffectPayload(payload) {
    if (!payload.name || !payload.prompt) {
      const error = new Error("Effect name and prompt are required.");
      error.statusCode = 400;
      throw error;
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
