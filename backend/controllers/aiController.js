const materialsRepository = require("../services/materialService");
const conversationsRepository = require("../services/conversationService");
const summaryFileService = require("../services/summaryFileService");

const { retrieveRelevantChunks } = require("../helpers/ragHelper");
const {
  generateAnswerFromContext,
  generateSummaryFromContext,
} = require("../helpers/aiHelper");

const { buildUniqueSources } = require("../utils/fileUtils");

const ASK_AI = "askAI";
const SUMMARIZE_AI = "summarizeAI";

function getProjectId(req) {
  const projectId = req.body.projectId || req.query.projectId;

  if (!projectId || !projectId.trim()) {
    return null;
  }

  return projectId.trim();
}

function getUserId(req) {
  const userId = req.user?.uid;

  if (!userId) {
    return null;
  }

  return userId;
}

async function askRag(req, res) {
  try {
    const { chatId, question } = req.body;
    const projectId = getProjectId(req);
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId" });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Missing question" });
    }

    await conversationsRepository.addMessageToChat(
      ASK_AI,
      chatId,
      {
        role: "user",
        type: "text",
        content: question.trim(),
      },
      projectId,
      userId
    );

    const materials = await materialsRepository.getAllMaterials(
      projectId,
      userId
    );

    if (materials.length === 0) {
      return res.status(400).json({
        error: "No uploaded materials found",
      });
    }

    const relevantChunks = await retrieveRelevantChunks(
      materials,
      question.trim(),
      5
    );

    let answer;
    let sources;

    if (relevantChunks.length === 0) {
      answer =
        "The answer was not found in the uploaded study materials.";

      sources = [];
    } else {
      answer = await generateAnswerFromContext(
        question.trim(),
        relevantChunks
      );

      sources = buildUniqueSources(relevantChunks);
    }

    const assistantMessage = {
      role: "assistant",
      type: "text",
      content: answer,
      sources,
    };

    await conversationsRepository.addMessageToChat(
      ASK_AI,
      chatId,
      assistantMessage,
      projectId,
      userId
    );

    res.json({
      chatId,
      message: assistantMessage,
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
    const { chatId, topic } = req.body;
    const projectId = getProjectId(req);
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId" });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Missing summary topic",
      });
    }

    await conversationsRepository.addMessageToChat(
      SUMMARIZE_AI,
      chatId,
      {
        role: "user",
        type: "text",
        content: topic.trim(),
      },
      projectId,
      userId
    );

    const materials = await materialsRepository.getAllMaterials(
      projectId,
      userId
    );

    if (materials.length === 0) {
      return res.status(400).json({
        error: "No uploaded materials found",
      });
    }

    const relevantChunks = await retrieveRelevantChunks(
      materials,
      topic.trim(),
      8
    );

    let summary;
    let sources;

    if (relevantChunks.length === 0) {
      summary =
        "No relevant information was found in the uploaded study materials for this topic.";

      sources = [];
    } else {
      summary = await generateSummaryFromContext(
        topic.trim(),
        relevantChunks
      );

      sources = buildUniqueSources(relevantChunks);
    }

    const summaryFile = await summaryFileService.uploadSummaryTxt(
      projectId,
      chatId,
      summary
    );

    const assistantMessage = {
      role: "assistant",
      type: "file",
      content: "Summary file created",
      file: summaryFile,
      sources,
    };

    await conversationsRepository.addMessageToChat(
      SUMMARIZE_AI,
      chatId,
      assistantMessage,
      projectId,
      userId
    );

    res.json({
      chatId,
      message: assistantMessage,
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