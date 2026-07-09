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
    await ensureEffectMetadataColumns(connection);
    await ensureGenerationUserColumn(connection);
    await ensureGenerationPromptColumns(connection);
    await migrateAdminsToUsers(connection);
    await runSqlFile(connection, "seed.sql");
    await seedPromptVersions(connection);
    await seedBootstrapAdmin(connection);
    console.log(`Database '${env.db.name}' is ready.`);
  } finally {
    await connection.end();
  }
}

async function ensureEffectMetadataColumns(connection) {
  await ensureColumn(connection, "effects", "category", "ALTER TABLE effects ADD COLUMN category VARCHAR(80) NOT NULL DEFAULT 'General' AFTER description");
  await ensureColumn(connection, "effects", "tags", "ALTER TABLE effects ADD COLUMN tags VARCHAR(255) NOT NULL DEFAULT '' AFTER category");
  await ensureIndex(connection, "effects", "idx_effects_category", "CREATE INDEX idx_effects_category ON effects (category)");
}

async function ensureGenerationUserColumn(connection) {
  await ensureColumn(connection, "generations", "user_id", "ALTER TABLE generations ADD COLUMN user_id CHAR(36) NULL AFTER id");
  await ensureIndex(connection, "generations", "idx_generations_user_id", "CREATE INDEX idx_generations_user_id ON generations (user_id)");
}

async function ensureGenerationPromptColumns(connection) {
  await ensureColumn(connection, "generations", "prompt_version_id", "ALTER TABLE generations ADD COLUMN prompt_version_id CHAR(36) NULL AFTER effect_name");
  await ensureColumn(connection, "generations", "prompt_text", "ALTER TABLE generations ADD COLUMN prompt_text TEXT NULL AFTER prompt_version_id");
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

async function seedPromptVersions(connection) {
  const [effects] = await connection.query("SELECT id, prompt FROM effects");

  for (const effect of effects) {
    const [versions] = await connection.execute(
      "SELECT id FROM effect_prompt_versions WHERE effect_id = ? AND prompt = ? LIMIT 1",
      [effect.id, effect.prompt]
    );

    if (versions.length === 0) {
      await connection.execute(
        "INSERT INTO effect_prompt_versions (id, effect_id, prompt) VALUES (?, ?, ?)",
        [randomUUID(), effect.id, effect.prompt]
      );
    }
  }
}

async function ensureColumn(connection, tableName, columnName, alterStatement) {
  const [columns] = await connection.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [env.db.name, tableName, columnName]
  );

  if (columns.length === 0) {
    await connection.query(alterStatement);
  }
}

async function ensureIndex(connection, tableName, indexName, createStatement) {
  const [indexes] = await connection.execute(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [env.db.name, tableName, indexName]
  );

  if (indexes.length === 0) {
    await connection.query(createStatement);
  }
}

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = setupDatabase;
