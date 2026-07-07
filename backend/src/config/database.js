const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  ...(env.db.socketPath
    ? { socketPath: env.db.socketPath }
    : {
        host: env.db.host,
        port: env.db.port,
      }),
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

module.exports = pool;
