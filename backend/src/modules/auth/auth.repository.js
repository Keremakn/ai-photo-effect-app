const db = require("../../config/database");

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

class AuthRepository {
  async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [
      email,
    ]);

    return mapUser(rows[0]);
  }

  async findById(id) {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [
      id,
    ]);

    return mapUser(rows[0]);
  }

  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM users ORDER BY created_at DESC"
    );

    return rows.map(mapUser);
  }

  async create(user) {
    await db.execute(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [user.id, user.email, user.passwordHash, user.role]
    );

    return this.findById(user.id);
  }

  async updateRole(id, role) {
    const [result] = await db.execute(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  async createRoleHistory({ id, userId, previousRole, nextRole, changedBy }) {
    await db.execute(
      `INSERT INTO user_role_history (id, user_id, previous_role, next_role, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, previousRole, nextRole, changedBy || null]
    );
  }

  async findRoleHistory(userId) {
    const [rows] = await db.execute(
      `SELECT
        user_role_history.*,
        changed_by_user.email AS changed_by_email
       FROM user_role_history
       LEFT JOIN users AS changed_by_user ON changed_by_user.id = user_role_history.changed_by
       WHERE user_role_history.user_id = ?
       ORDER BY user_role_history.created_at DESC`,
      [userId]
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      previousRole: row.previous_role,
      nextRole: row.next_role,
      changedBy: row.changed_by,
      changedByEmail: row.changed_by_email,
      createdAt: row.created_at,
    }));
  }
}

module.exports = new AuthRepository();
