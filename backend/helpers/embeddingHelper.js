const { GoogleGenAI } = require("@google/genai");
const { normalizeGeminiError, } = require("./geminiErrorHelper");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    const embedding = response?.embeddings?.[0]?.values;

    if (!embedding) {
      throw new Error("Gemini did not return an embedding");
    }

    return embedding;
  } catch (error) {
    console.error("GEMINI EMBEDDING ERROR:", error);

    throw normalizeGeminiError(error);
  }
}

module.exports = {
  generateEmbedding,
};