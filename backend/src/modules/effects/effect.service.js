const { randomUUID } = require("crypto");

class EffectService {
  constructor(effectRepository) {
    this.effectRepository = effectRepository;
  }

  getActiveEffects() {
    return this.effectRepository.findActive().map(this.toPublicEffect);
  }

  getAllEffects() {
    return this.effectRepository.findAll();
  }

  createEffect(payload) {
    this.validateEffectPayload(payload);

    const id = payload.id || randomUUID();

    if (this.effectRepository.findById(id)) {
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

  updateEffect(id, payload) {
    const updatedEffect = this.effectRepository.update(id, {
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

  deleteEffect(id) {
    const deletedEffect = this.effectRepository.delete(id);

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
