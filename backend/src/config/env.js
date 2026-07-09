require("dotenv").config();

function readNumber(key, fallback) {
  const value = process.env[key];

  if (value === undefined || value === "") {
    return fallback;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid env variable ${key}: expected a number.`);
  }

  return parsedValue;
}

const env = {
  port: readNumber("PORT", 3001),
  nodeEnv: process.env.NODE_ENV || "development",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3001",
  aiProvider: process.env.AI_PROVIDER || "mock",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  rateLimit: {
    windowMs: readNumber("RATE_LIMIT_WINDOW_MS", 60 * 1000),
    max: readNumber("RATE_LIMIT_MAX", 100),
    generateMax: readNumber("GENERATE_RATE_LIMIT_MAX", 5),
    loginMax: readNumber("LOGIN_RATE_LIMIT_MAX", 5),
  },
  replicateApiToken: process.env.REPLICATE_API_TOKEN,
  replicateModel: process.env.REPLICATE_MODEL || "black-forest-labs/flux-kontext-pro",
  replicateWaitSeconds: readNumber("REPLICATE_WAIT_SECONDS", 60),
  replicatePollIntervalMs: readNumber("REPLICATE_POLL_INTERVAL_MS", 1500),
  replicateMaxPollAttempts: readNumber("REPLICATE_MAX_POLL_ATTEMPTS", 80),
  replicateInputImageField: process.env.REPLICATE_INPUT_IMAGE_FIELD || "input_image",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: readNumber("DB_PORT", 3306),
    socketPath: process.env.DB_SOCKET_PATH || "",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "ai_photo_effect_app",
  },
};

const requiredEnvKeys = ["JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD", "DB_USER", "DB_NAME"];

if (!env.db.socketPath) {
  requiredEnvKeys.push("DB_HOST");
}

if (env.aiProvider === "replicate") {
  requiredEnvKeys.push("REPLICATE_API_TOKEN");
}

const missingEnvKeys = requiredEnvKeys.filter((key) => !process.env[key]);

if (missingEnvKeys.length > 0) {
  throw new Error(`Missing required env variables: ${missingEnvKeys.join(", ")}`);
}

module.exports = env;
