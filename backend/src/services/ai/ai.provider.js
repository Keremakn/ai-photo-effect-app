const env = require("../../config/env");
const MockAIProvider = require("./mock-ai.provider");
const ReplicateAIProvider = require("./replicate-ai.provider");

function createAIProvider() {
  if (env.aiProvider === "replicate") {
    return new ReplicateAIProvider();
  }

  return new MockAIProvider();
}

module.exports = createAIProvider;
