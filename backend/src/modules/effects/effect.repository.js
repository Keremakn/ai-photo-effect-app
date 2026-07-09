const db = require("../../config/database");

function mapEffect(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category || "General",
    tags: row.tags ? row.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    prompt: row.prompt,
    isActive: Boolean(row.is_active),
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class EffectRepository {
  async findActive(userId = null) {
    const sql = userId
      ? `SELECT effects.*, favorite_effects.effect_id IS NOT NULL AS is_favorite
         FROM effects
         LEFT JOIN favorite_effects ON favorite_effects.effect_id = effects.id AND favorite_effects.user_id = ?
         WHERE effects.is_active = 1
         ORDER BY effects.created_at ASC`
      : "SELECT effects.*, 0 AS is_favorite FROM effects WHERE is_active = 1 ORDER BY created_at ASC";
    const params = userId ? [userId] : [];
    const [rows] = await db.execute(sql, params);

    return rows.map(mapEffect);
  }

  async findAll() {
    const [rows] = await db.execute("SELECT * FROM effects ORDER BY created_at ASC");
    return rows.map(mapEffect);
  }

  async findById(id) {
    const [rows] = await db.execute("SELECT * FROM effects WHERE id = ? LIMIT 1", [id]);
    return mapEffect(rows[0]);
  }

  async findFavoriteEffects(userId) {
    const [rows] = await db.execute(
      `SELECT effects.*, 1 AS is_favorite
       FROM favorite_effects
       INNER JOIN effects ON effects.id = favorite_effects.effect_id
       WHERE favorite_effects.user_id = ?
       ORDER BY favorite_effects.created_at DESC`,
      [userId]
    );

    return rows.map(mapEffect);
  }

  async create(effect) {
    await db.execute(
      `INSERT INTO effects (id, name, description, category, tags, prompt, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        effect.id,
        effect.name,
        effect.description,
        effect.category,
        effect.tags.join(","),
        effect.prompt,
        effect.isActive ? 1 : 0,
      ]
    );

    return this.findById(effect.id);
  }

  async update(id, payload) {
    const fields = [];
    const values = [];

    if (payload.name !== undefined) {
      fields.push("name = ?");
      values.push(payload.name);
    }

    if (payload.description !== undefined) {
      fields.push("description = ?");
      values.push(payload.description);
    }

    if (payload.prompt !== undefined) {
      fields.push("prompt = ?");
      values.push(payload.prompt);
    }

    if (payload.category !== undefined) {
      fields.push("category = ?");
      values.push(payload.category);
    }

    if (payload.tags !== undefined) {
      fields.push("tags = ?");
      values.push(payload.tags.join(","));
    }

    if (payload.isActive !== undefined) {
      fields.push("is_active = ?");
      values.push(payload.isActive ? 1 : 0);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const [result] = await db.execute(
      `UPDATE effects SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id) {
    const effect = await this.findById(id);

    if (!effect) {
      return null;
    }

    await db.execute("DELETE FROM effects WHERE id = ?", [id]);
    return effect;
  }

  async createPromptVersion({ id, effectId, prompt, createdBy }) {
    await db.execute(
      `INSERT INTO effect_prompt_versions (id, effect_id, prompt, created_by)
       VALUES (?, ?, ?, ?)`,
      [id, effectId, prompt, createdBy || null]
    );

    return this.findLatestPromptVersion(effectId);
  }

  async findLatestPromptVersion(effectId) {
    const [rows] = await db.execute(
      `SELECT * FROM effect_prompt_versions
       WHERE effect_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [effectId]
    );

    return rows[0] ? {
      id: rows[0].id,
      effectId: rows[0].effect_id,
      prompt: rows[0].prompt,
      createdBy: rows[0].created_by,
      createdAt: rows[0].created_at,
    } : null;
  }

  async findPromptVersions(effectId) {
    const [rows] = await db.execute(
      `SELECT effect_prompt_versions.*, users.email AS created_by_email
       FROM effect_prompt_versions
       LEFT JOIN users ON users.id = effect_prompt_versions.created_by
       WHERE effect_prompt_versions.effect_id = ?
       ORDER BY effect_prompt_versions.created_at DESC`,
      [effectId]
    );

    return rows.map((row) => ({
      id: row.id,
      effectId: row.effect_id,
      prompt: row.prompt,
      createdBy: row.created_by,
      createdByEmail: row.created_by_email,
      createdAt: row.created_at,
    }));
  }

  async setFavorite(userId, effectId, isFavorite) {
    if (isFavorite) {
      await db.execute(
        "INSERT IGNORE INTO favorite_effects (user_id, effect_id) VALUES (?, ?)",
        [userId, effectId]
      );
      return;
    }

    await db.execute(
      "DELETE FROM favorite_effects WHERE user_id = ? AND effect_id = ?",
      [userId, effectId]
    );
  }
}

module.exports = new EffectRepository();
