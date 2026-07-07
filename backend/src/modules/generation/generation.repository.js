const db = require("../../config/database");

function mapGeneration(row) {
  return {
    id: row.id,
    effectId: row.effect_id,
    effectName: row.effect_name,
    inputImageUrl: row.input_image_url,
    resultImageUrl: row.result_image_url,
    provider: row.provider,
    createdAt: row.created_at,
  };
}

class GenerationRepository {
  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM generations ORDER BY created_at DESC"
    );

    return rows.map(mapGeneration);
  }

  async create(generation) {
    await db.execute(
      `INSERT INTO generations
        (id, effect_id, effect_name, input_image_url, result_image_url, provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generation.id,
        generation.effectId,
        generation.effectName,
        generation.inputImageUrl,
        generation.resultImageUrl,
        generation.provider,
        generation.createdAt,
      ]
    );

    return generation;
  }
}

module.exports = new GenerationRepository();
