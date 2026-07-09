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
    await runSqlFile(connection, "seed.sql");
    await seedAdmin(connection);
    console.log(`Database '${env.db.name}' is ready.`);
  } finally {
    await connection.end();
  }
}

async function seedAdmin(connection) {
  const passwordHash = await bcrypt.hash(env.admin.password, 12);

  await connection.execute(
    `INSERT INTO admins (id, email, password_hash, role)
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
