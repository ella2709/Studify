const { splitTextIntoChunks, scoreChunkAgainstQuery } = require("../utils/textUtils");

function retrieveRelevantChunks(materials, query, limit = 5) {
  const allChunks = [];

  for (const material of materials) {
    const chunks = splitTextIntoChunks(material.text);

    chunks.forEach((chunkText, index) => {
      allChunks.push({
        materialId: material.id,
        fileName: material.originalName,
        chunkIndex: index,
        text: chunkText,
        score: scoreChunkAgainstQuery(chunkText, query),
      });
    });
  }

  return allChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getAllMaterialsCombinedText(materials, maxChars = 12000) {
  const parts = materials.map(
    (material) => `FILE: ${material.originalName}\n${material.text}`
  );

  return parts.join("\n\n--------------------\n\n").slice(0, maxChars);
}

module.exports = {
  retrieveRelevantChunks,
  getAllMaterialsCombinedText,
};