class MockAIProvider {
  async generate({ imagePath, prompt }) {
    return {
      resultImageUrl: "https://placehold.co/1024x1024/png?text=AI+Photo+Effect",
      provider: "mock",
      metadata: {
        sourceImagePath: imagePath,
        prompt,
      },
    };
  }
}

module.exports = MockAIProvider;
