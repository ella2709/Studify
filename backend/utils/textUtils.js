function normalizeText(text) {
  return (text || "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectLanguage(text) {
  return /[\u0590-\u05FF]/.test(text) ? "Hebrew" : "English";
}

function splitTextIntoChunks(text, maxChunkLength = 900) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (!currentChunk) {
      currentChunk = paragraph;
      continue;
    }

    const candidate = `${currentChunk}\n\n${paragraph}`;
    if (candidate.length <= maxChunkLength) {
      currentChunk = candidate;
    } else {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1);
}

function scoreChunkAgainstQuery(chunkText, query) {
  const chunkTokens = tokenize(chunkText);
  const queryTokens = tokenize(query);

  if (chunkTokens.length === 0 || queryTokens.length === 0) {
    return 0;
  }

  const chunkSet = new Set(chunkTokens);

  let score = 0;
  for (const token of queryTokens) {
    if (chunkSet.has(token)) {
      score += 1;
    }
  }

  if (chunkText.toLowerCase().includes(query.toLowerCase())) {
    score += 3;
  }

  return score;
}



module.exports = {
  normalizeText,
  splitTextIntoChunks,
  tokenize,
  scoreChunkAgainstQuery,
  detectLanguage
};