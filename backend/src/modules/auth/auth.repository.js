const db = require("../../config/database");

function mapAdmin(row) {
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
    const [rows] = await db.execute("SELECT * FROM admins WHERE email = ? LIMIT 1", [
      email,
    ]);

    return mapAdmin(rows[0]);
  }

  async findById(id) {
    const [rows] = await db.execute("SELECT * FROM admins WHERE id = ? LIMIT 1", [
      id,
    ]);

    return mapAdmin(rows[0]);
  }
}

module.exports = new AuthRepository();
