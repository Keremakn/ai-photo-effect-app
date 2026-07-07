const db = require("../../config/database");

function mapEffect(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    prompt: row.prompt,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class EffectRepository {
  async findActive() {
    const [rows] = await db.execute(
      "SELECT * FROM effects WHERE is_active = 1 ORDER BY created_at ASC"
    );

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

  async create(effect) {
    await db.execute(
      `INSERT INTO effects (id, name, description, prompt, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        effect.id,
        effect.name,
        effect.description,
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
}

module.exports = new EffectRepository();
