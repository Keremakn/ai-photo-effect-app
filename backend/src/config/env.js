require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || "development",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3001",
  aiProvider: process.env.AI_PROVIDER || "mock",
  replicateApiToken: process.env.REPLICATE_API_TOKEN,
  replicateModel: process.env.REPLICATE_MODEL || "black-forest-labs/flux-kontext-pro",
  replicateWaitSeconds: Number(process.env.REPLICATE_WAIT_SECONDS || 60),
  replicatePollIntervalMs: Number(process.env.REPLICATE_POLL_INTERVAL_MS || 1500),
  replicateMaxPollAttempts: Number(process.env.REPLICATE_MAX_POLL_ATTEMPTS || 80),
  replicateInputImageField: process.env.REPLICATE_INPUT_IMAGE_FIELD || "input_image",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    socketPath: process.env.DB_SOCKET_PATH || "",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "ai_photo_effect_app",
  },
};

module.exports = env;
