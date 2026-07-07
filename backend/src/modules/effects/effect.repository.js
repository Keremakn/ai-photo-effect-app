const effects = [
  {
    id: "cartoon",
    name: "Cartoon",
    description: "Cartoon style effect",
    prompt: "Transform this photo into a clean cartoon style.",
    isActive: true,
  },
  {
    id: "anime",
    name: "Anime",
    description: "Anime style effect",
    prompt: "Transform this photo into anime style.",
    isActive: true,
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Cinematic color grade",
    prompt: "Transform this photo with a cinematic film color grade.",
    isActive: true,
  },
];

class EffectRepository {
  findActive() {
    return effects.filter((effect) => effect.isActive);
  }

  findAll() {
    return effects;
  }

  findById(id) {
    return effects.find((effect) => effect.id === id);
  }

  create(effect) {
    effects.push(effect);
    return effect;
  }

  update(id, payload) {
    const effect = this.findById(id);

    if (!effect) {
      return null;
    }

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        effect[key] = value;
      }
    });

    return effect;
  }

  delete(id) {
    const index = effects.findIndex((effect) => effect.id === id);

    if (index === -1) {
      return null;
    }

    const [deletedEffect] = effects.splice(index, 1);
    return deletedEffect;
  }
}

module.exports = new EffectRepository();
