const conversationService = require("../services/conversationService");
const { toChatDto, toMessageDto } = require("../Dtos/conversationDto");

const ASK_AI = "askAI";
const SUMMARIZE_AI = "summarizeAI";

function getProjectId(req) {
  const projectId = req.body.projectId || req.query.projectId;

  if (!projectId || !projectId.trim()) {
    return null;
  }

  return projectId.trim();
}

async function createAskAIChat(req, res) {
  try {
    const { title } = req.body;
    const projectId = getProjectId(req);

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Missing chat title" });
    }

    const chat = await conversationService.createChat(
      ASK_AI,
      title.trim(),
      projectId
    );

    res.json({ chat: toChatDto(chat) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to create ask AI chat",
    });
  }
}

async function createSummarizeAIChat(req, res) {
  try {
    const { title } = req.body;
    const projectId = getProjectId(req);

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Missing chat title" });
    }

    const chat = await conversationService.createChat(
      SUMMARIZE_AI,
      title.trim(),
      projectId
    );

    res.json({ chat: toChatDto(chat) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to create summarize AI chat",
    });
  }
}

async function getAskAIChats(req, res) {
  try {
    const projectId = getProjectId(req);

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const chats = await conversationService.getChats(ASK_AI, projectId);

    res.json({ chats: chats.map(toChatDto) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to get ask AI chats",
    });
  }
}

async function getSummarizeAIChats(req, res) {
  try {
    const projectId = getProjectId(req);

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const chats = await conversationService.getChats(
      SUMMARIZE_AI,
      projectId
    );

    res.json({ chats: chats.map(toChatDto) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to get summarize AI chats",
    });
  }
}

async function getAskAIChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const projectId = getProjectId(req);

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId" });
    }

    const messages = await conversationService.getChatMessages(
      ASK_AI,
      chatId,
      projectId
    );

    res.json({ messages: messages.map(toMessageDto) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to get ask AI messages",
    });
  }
}

async function getSummarizeAIChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const projectId = getProjectId(req);

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId" });
    }

    const messages = await conversationService.getChatMessages(
      SUMMARIZE_AI,
      chatId,
      projectId
    );

    res.json({ messages: messages.map(toMessageDto) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to get summarize AI messages",
    });
  }
}

module.exports = {
  createAskAIChat,
  createSummarizeAIChat,
  getAskAIChats,
  getSummarizeAIChats,
  getAskAIChatMessages,
  getSummarizeAIChatMessages,
};