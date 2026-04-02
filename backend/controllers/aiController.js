const materialsService = require("../services/materialsService");
const { retrieveRelevantChunks, getAllMaterialsCombinedText } = require("../services/ragService");
const { generateAnswerFromContext, generateSummaryFromMaterials } = require("../services/aiService");

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
    const materials = materialsService.getAllMaterials();

    if (materials.length === 0) {
      return res.status(400).json({ error: "No uploaded materials found" });
    }

    const combinedText = getAllMaterialsCombinedText(materials, 12000);

    if (!combinedText.trim()) {
      return res.status(400).json({ error: "Uploaded materials are empty" });
    }

    const summary = await generateSummaryFromMaterials(combinedText);

    res.json({
      summary,
      basedOnFiles: materials.map((file) => file.originalName),
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