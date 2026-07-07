const generations = [];

class GenerationRepository {
  findAll() {
    return generations;
  }

  create(generation) {
    generations.unshift(generation);
    return generation;
  }
}

module.exports = new GenerationRepository();
