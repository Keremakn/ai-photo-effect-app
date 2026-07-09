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
}

module.exports = new AuthRepository();
