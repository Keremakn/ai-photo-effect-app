const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const env = require("../config/env");

async function runSqlFile(connection, filename) {
  const sql = await fs.readFile(path.join(__dirname, filename), "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

async function setupDatabase() {
  const connection = await mysql.createConnection({
    ...(env.db.socketPath
      ? { socketPath: env.db.socketPath }
      : {
          host: env.db.host,
          port: env.db.port,
        }),
    user: env.db.user,
    password: env.db.password,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${env.db.name}\``);
    await runSqlFile(connection, "schema.sql");
    await ensureGenerationUserColumn(connection);
    await migrateAdminsToUsers(connection);
    await runSqlFile(connection, "seed.sql");
    await seedBootstrapAdmin(connection);
    console.log(`Database '${env.db.name}' is ready.`);
  } finally {
    await connection.end();
  }
}

async function ensureGenerationUserColumn(connection) {
  const [columns] = await connection.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'generations' AND COLUMN_NAME = 'user_id'`,
    [env.db.name]
  );

  if (columns.length === 0) {
    await connection.query("ALTER TABLE generations ADD COLUMN user_id CHAR(36) NULL AFTER id");
  }

  const [indexes] = await connection.execute(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'generations' AND INDEX_NAME = 'idx_generations_user_id'`,
    [env.db.name]
  );

  if (indexes.length === 0) {
    await connection.query("CREATE INDEX idx_generations_user_id ON generations (user_id)");
  }
}

async function migrateAdminsToUsers(connection) {
  await connection.query(
    `INSERT INTO users (id, email, password_hash, role, created_at)
     SELECT id, email, password_hash, role, created_at
     FROM admins
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       role = VALUES(role)`
  );
}

async function seedBootstrapAdmin(connection) {
  const passwordHash = await bcrypt.hash(env.admin.password, 12);

  await connection.execute(
    `INSERT INTO users (id, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       role = VALUES(role)`,
    [randomUUID(), env.admin.email, passwordHash]
  );
}

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = setupDatabase;
