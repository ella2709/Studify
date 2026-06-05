const materialsRepository = require("../firebase/materialsRepository");
const conversationsRepository = require("../firebase/conversationsRepository");
const { retrieveRelevantChunks } = require("../services/ragService");
const {
  generateAnswerFromContext,
  generateSummaryFromContext,
} = require("../services/aiService");
const { buildUniqueSources } = require("../utils/fileUtils");

const DEFAULT_PROJECT_ID = "defaultProject";

function getProjectId(req) {
  return req.body.projectId || req.query.projectId || DEFAULT_PROJECT_ID;
}

async function createAskAIChat(req, res) {
  try {
    const { title } = req.body;
    const projectId = getProjectId(req);

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Missing chat title" });
    }

    const chat = await conversationsRepository.createChat(
      "askAI",
      title.trim(),
      projectId
    );

    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to create chat" });
  }
}

async function createSummarizeAIChat(req, res) {
  try {
    const { title } = req.body;
    const projectId = getProjectId(req);

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Missing chat title" });
    }

    const chat = await conversationsRepository.createChat(
      "summarizeAI",
      title.trim(),
      projectId
    );

    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to create chat" });
  }
}

async function askRag(req, res) {
  try {
    const { chatId, question } = req.body;
    const projectId = getProjectId(req);

    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId" });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Missing question" });
    }

    await conversationsRepository.addMessageToChat(
      "askAI",
      chatId,
      {
        role: "user",
        content: question,
      },
      projectId
    );

    const materials = await materialsRepository.getAllMaterials(projectId);

    if (materials.length === 0) {
      return res.status(400).json({ error: "No uploaded materials found" });
    }

    const relevantChunks = await retrieveRelevantChunks(materials, question, 5);

    let answer;
    let sources;

    if (relevantChunks.length === 0) {
      answer = "The answer was not found in the uploaded study materials.";
      sources = [];
    } else {
      answer = await generateAnswerFromContext(question, relevantChunks);
      sources = buildUniqueSources(relevantChunks);
    }

    await conversationsRepository.addMessageToChat(
      "askAI",
      chatId,
      {
        role: "assistant",
        content: answer,
        sources,
      },
      projectId
    );

    res.json({
      chatId,
      answer,
      sources,
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

    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId" });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Missing summary topic" });
    }

    await conversationsRepository.addMessageToChat(
      "summarizeAI",
      chatId,
      {
        role: "user",
        content: topic,
      },
      projectId
    );

    const materials = await materialsRepository.getAllMaterials(projectId);

    if (materials.length === 0) {
      return res.status(400).json({ error: "No uploaded materials found" });
    }

    const relevantChunks = await retrieveRelevantChunks(materials, topic, 8);

    let summary;
    let sources;

    if (relevantChunks.length === 0) {
      summary =
        "No relevant information was found in the uploaded study materials for this topic.";
      sources = [];
    } else {
      summary = await generateSummaryFromContext(topic, relevantChunks);
      sources = buildUniqueSources(relevantChunks);
    }

    await conversationsRepository.addMessageToChat(
      "summarizeAI",
      chatId,
      {
        role: "assistant",
        content: summary,
        sources,
      },
      projectId
    );

    res.json({
      chatId,
      summary,
      sources,
    });
  } catch (err) {
    console.error("SUMMARIZE RAG ERROR:", err);
    res.status(500).json({
      error: err?.message || "RAG summarization failed",
    });
  }
}

async function getAskAIChats(req, res) {
  try {
    const projectId = getProjectId(req);
    const chats = await conversationsRepository.getChats("askAI", projectId);

    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to get chats" });
  }
}

async function getSummarizeAIChats(req, res) {
  try {
    const projectId = getProjectId(req);

    const chats = await conversationsRepository.getChats(
      "summarizeAI",
      projectId
    );

    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to get chats" });
  }
}

async function getAskAIChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const projectId = getProjectId(req);

    const messages = await conversationsRepository.getChatMessages(
      "askAI",
      chatId,
      projectId
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to get messages" });
  }
}

async function getSummarizeAIChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const projectId = getProjectId(req);

    const messages = await conversationsRepository.getChatMessages(
      "summarizeAI",
      chatId,
      projectId
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to get messages" });
  }
}

module.exports = {
  createAskAIChat,
  createSummarizeAIChat,
  askRag,
  summarizeRag,
  getAskAIChats,
  getSummarizeAIChats,
  getAskAIChatMessages,
  getSummarizeAIChatMessages,
};