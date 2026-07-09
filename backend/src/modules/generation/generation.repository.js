const db = require("../../config/database");

function normalizeLimitOffset({ limit = 20, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  return { safeLimit, safeOffset };
}

function mapGeneration(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email || null,
    userRole: row.user_role || null,
    effectId: row.effect_id,
    effectName: row.effect_name,
    promptVersionId: row.prompt_version_id,
    promptText: row.prompt_text,
    inputImageUrl: row.input_image_url,
    resultImageUrl: row.result_image_url,
    provider: row.provider,
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at,
  };
}

class GenerationRepository {
  async findAll({ limit = 20, offset = 0 } = {}) {
    const { safeLimit, safeOffset } = normalizeLimitOffset({ limit, offset });
    const [rows] = await db.execute(
      `SELECT
        generations.*,
        users.email AS user_email,
        users.role AS user_role,
        0 AS is_favorite
       FROM generations
       LEFT JOIN users ON users.id = generations.user_id
       ORDER BY generations.created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`
    );

    return rows.map(mapGeneration);
  }

  async countAll() {
    const [rows] = await db.execute("SELECT COUNT(*) AS total FROM generations");
    return rows[0].total;
  }

  async findByUserId(userId, { limit = 20, offset = 0, favoritesOnly = false } = {}) {
    const { safeLimit, safeOffset } = normalizeLimitOffset({ limit, offset });
    const favoriteJoin = favoritesOnly
      ? "INNER JOIN favorite_generations ON favorite_generations.generation_id = generations.id AND favorite_generations.user_id = ?"
      : "LEFT JOIN favorite_generations ON favorite_generations.generation_id = generations.id AND favorite_generations.user_id = ?";
    const [rows] = await db.execute(
      `SELECT
        generations.*,
        users.email AS user_email,
        users.role AS user_role,
        favorite_generations.generation_id IS NOT NULL AS is_favorite
       FROM generations
       LEFT JOIN users ON users.id = generations.user_id
       ${favoriteJoin}
       WHERE generations.user_id = ?
       ORDER BY generations.created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [userId, userId]
    );

    return rows.map(mapGeneration);
  }

  async countByUserId(userId, { favoritesOnly = false } = {}) {
    const join = favoritesOnly
      ? "INNER JOIN favorite_generations ON favorite_generations.generation_id = generations.id AND favorite_generations.user_id = ?"
      : "";
    const params = favoritesOnly ? [userId, userId] : [userId];
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM generations
       ${join}
       WHERE generations.user_id = ?`,
      params
    );

    return rows[0].total;
  }

  async create(generation) {
    await db.execute(
      `INSERT INTO generations
        (id, user_id, effect_id, effect_name, prompt_version_id, prompt_text, input_image_url, result_image_url, provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generation.id,
        generation.userId,
        generation.effectId,
        generation.effectName,
        generation.promptVersionId,
        generation.promptText,
        generation.inputImageUrl,
        generation.resultImageUrl,
        generation.provider,
      ]
    );

    const [rows] = await db.execute(
      `SELECT
        generations.*,
        users.email AS user_email,
        users.role AS user_role,
        0 AS is_favorite
       FROM generations
       LEFT JOIN users ON users.id = generations.user_id
       WHERE generations.id = ?
       LIMIT 1`,
      [generation.id]
    );

    return mapGeneration(rows[0]);
  }

  async setFavorite(userId, generationId, isFavorite) {
    if (isFavorite) {
      await db.execute(
        `INSERT IGNORE INTO favorite_generations (user_id, generation_id)
         VALUES (?, ?)`,
        [userId, generationId]
      );
      return;
    }

    await db.execute(
      "DELETE FROM favorite_generations WHERE user_id = ? AND generation_id = ?",
      [userId, generationId]
    );
  }

  async getDashboardStats() {
    const [dailyRows] = await db.execute(
      `SELECT DATE(created_at) AS date, COUNT(*) AS total
       FROM generations
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`
    );
    const [activeUserRows] = await db.execute(
      `SELECT COUNT(DISTINCT user_id) AS total
       FROM generations
       WHERE user_id IS NOT NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    const [topEffectRows] = await db.execute(
      `SELECT effect_id, effect_name, COUNT(*) AS total
       FROM generations
       GROUP BY effect_id, effect_name
       ORDER BY total DESC
       LIMIT 5`
    );

    return {
      dailyGenerations: dailyRows.map((row) => ({
        date: row.date,
        total: row.total,
      })),
      activeUsers30d: activeUserRows[0].total,
      topEffects: topEffectRows.map((row) => ({
        effectId: row.effect_id,
        effectName: row.effect_name,
        total: row.total,
      })),
    };
  }
}

module.exports = new GenerationRepository();
