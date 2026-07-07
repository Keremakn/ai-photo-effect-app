const fs = require("fs/promises");
const axios = require("axios");
const env = require("../../config/env");

const TERMINAL_STATUSES = new Set(["succeeded", "failed", "canceled"]);

class ReplicateAIProvider {
  constructor() {
    this.client = axios.create({
      baseURL: "https://api.replicate.com/v1",
      timeout: 120000,
    });
  }

  async generate({ imagePath, mimeType, prompt }) {
    this.ensureConfigured();

    const imageDataUrl = await this.createDataUrl(imagePath, mimeType);
    const prediction = await this.createPrediction({
      prompt,
      imageDataUrl,
    });
    const completedPrediction = await this.waitForPrediction(prediction);
    const resultImageUrl = this.extractResultImageUrl(completedPrediction.output);

    if (!resultImageUrl) {
      const error = new Error("Replicate did not return an image URL.");
      error.statusCode = 502;
      throw error;
    }

    return {
      resultImageUrl,
      provider: "replicate",
      metadata: {
        predictionId: completedPrediction.id,
        status: completedPrediction.status,
      },
    };
  }

  ensureConfigured() {
    if (!env.replicateApiToken) {
      const error = new Error("REPLICATE_API_TOKEN is required when AI_PROVIDER=replicate.");
      error.statusCode = 500;
      throw error;
    }
  }

  async createPrediction({ prompt, imageDataUrl }) {
    const response = await this.client.post(
      this.getPredictionEndpoint(),
      this.getPredictionPayload({ prompt, imageDataUrl }),
      {
        headers: this.getHeaders({
          Prefer: `wait=${env.replicateWaitSeconds}`,
        }),
      }
    );

    return response.data;
  }

  async waitForPrediction(prediction) {
    if (TERMINAL_STATUSES.has(prediction.status)) {
      return this.validatePrediction(prediction);
    }

    let currentPrediction = prediction;

    for (let attempt = 0; attempt < env.replicateMaxPollAttempts; attempt += 1) {
      await this.sleep(env.replicatePollIntervalMs);
      currentPrediction = await this.getPrediction(currentPrediction.id);

      if (TERMINAL_STATUSES.has(currentPrediction.status)) {
        return this.validatePrediction(currentPrediction);
      }
    }

    const error = new Error("Replicate prediction timed out.");
    error.statusCode = 504;
    throw error;
  }

  async getPrediction(predictionId) {
    const response = await this.client.get(`/predictions/${predictionId}`, {
      headers: this.getHeaders(),
    });

    return response.data;
  }

  validatePrediction(prediction) {
    if (prediction.status === "succeeded") {
      return prediction;
    }

    const error = new Error(prediction.error || `Replicate prediction ${prediction.status}.`);
    error.statusCode = 502;
    throw error;
  }

  extractResultImageUrl(output) {
    if (typeof output === "string") {
      return output;
    }

    if (Array.isArray(output)) {
      return output.find((item) => typeof item === "string" && item.startsWith("http")) || null;
    }

    if (output && typeof output === "object") {
      return output.url || output.image || output.output || null;
    }

    return null;
  }

  async createDataUrl(imagePath, mimeType = "image/jpeg") {
    const imageBuffer = await fs.readFile(imagePath);
    return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
  }

  getPredictionEndpoint() {
    const [owner, model] = env.replicateModel.split("/");

    if (owner && model && !model.includes(":")) {
      return `/models/${owner}/${model}/predictions`;
    }

    return "/predictions";
  }

  getPredictionPayload({ prompt, imageDataUrl }) {
    const payload = {
      input: {
        prompt,
        [env.replicateInputImageField]: imageDataUrl,
        output_format: "png",
      },
    };

    if (this.getPredictionEndpoint() === "/predictions") {
      payload.version = env.replicateModel;
    }

    return payload;
  }

  getHeaders(extraHeaders = {}) {
    return {
      Authorization: `Bearer ${env.replicateApiToken}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    };
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

module.exports = ReplicateAIProvider;
