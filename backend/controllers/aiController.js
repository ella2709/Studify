const materialsService = require("../services/materialsService");
const { retrieveRelevantChunks } = require("../services/ragService");
const { generateAnswerFromContext, generateSummaryFromContext } = require("../services/aiService");

async function askRag(req, res) {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Missing question" });
    }

    const materials = materialsService.getAllMaterials();

    if (materials.length === 0) {
      return res.status(400).json({ error: "No uploaded materials found" });
    }

    const relevantChunks = retrieveRelevantChunks(materials, question, 5);

    if (relevantChunks.length === 0) {
      return res.json({
        answer: "The answer was not found in the uploaded study materials.",
        sources: [],
      });
    }

    const answer = await generateAnswerFromContext(question, relevantChunks);

    res.json({
      answer,
      sources: relevantChunks.map((chunk) => ({
        fileName: chunk.fileName,
        chunkIndex: chunk.chunkIndex,
      })),
    });
  } catch (err) {
    console.error("ASK RAG ERROR:", err);
    res.status(500).json({
      error: err?.message || "RAG question request failed",
    });
  }
}

async function summarizeRag(req, res) {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Missing summary topic" });
    }

    const materials = materialsService.getAllMaterials();

    if (materials.length === 0) {
      return res.status(400).json({ error: "No uploaded materials found" });
    }

    const relevantChunks = retrieveRelevantChunks(materials, topic, 8);

    if (relevantChunks.length === 0) {
      return res.json({
        summary: "No relevant information was found in the uploaded study materials for this topic.",
        basedOnFiles: [],
      });
    }

    const summary = await generateSummaryFromContext(topic, relevantChunks);

    res.json({
      summary,
      basedOnFiles: [...new Set(relevantChunks.map((chunk) => chunk.fileName))],
    });
  } catch (err) {
    console.error("SUMMARIZE RAG ERROR:", err);
    res.status(500).json({
      error: err?.message || "RAG summarization failed",
    });
  }
}

module.exports = {
  askRag,
  summarizeRag,
};