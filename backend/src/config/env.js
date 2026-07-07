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
};

module.exports = env;
