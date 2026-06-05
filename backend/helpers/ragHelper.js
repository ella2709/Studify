const { generateEmbedding } = require("./embeddingHelper");
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

const sortedChunks = allChunks.sort((a, b) => b.score - a.score);

if (sortedChunks.length === 0) {
  return [];
}

const bestScore = sortedChunks[0].score;

const MIN_SCORE = 0.2;
const SCORE_GAP_FROM_BEST = 0.06;

return sortedChunks
  .filter((chunk) => {
    return (
      chunk.score >= MIN_SCORE &&
      bestScore - chunk.score <= SCORE_GAP_FROM_BEST
    );
  })
  .slice(0, limit);
}

module.exports = {
  retrieveRelevantChunks,
};