const { generateEmbedding } = require("./embeddingService");
const { vectorsSimilarity } = require("../utils/vectorUtils");

async function retrieveRelevantChunks(materials, query, limit = 5) {
  const queryEmbedding = await generateEmbedding(query);
  const allChunks = [];

  for (const material of materials) {
    const chunks = material.chunks || [];

    for (const chunk of chunks) {
      const score = vectorsSimilarity(queryEmbedding, chunk.embedding);

      allChunks.push({
        materialId: material.id,
        fileName: material.originalName,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        score,
      });
    }
  }

  return allChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = {
  retrieveRelevantChunks,
};