const conversationService = require("../services/conversationService");
const { toChatDto, toMessageDto } = require("../Dtos/conversationDto");

const ASK_AI = "askAI";
const SUMMARIZE_AI = "summarizeAI";

function getProjectId(req) {
  const projectId = req.body?.projectId || req.query?.projectId;

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

async function createAskAIChat(req, res) {
  try {
    const { title } = req.body;
    const projectId = getProjectId(req);
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Missing chat title" });
    }

    const chat = await conversationService.createChat(
      ASK_AI,
      title.trim(),
      projectId,
      userId
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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Missing chat title" });
    }

    const chat = await conversationService.createChat(
      SUMMARIZE_AI,
      title.trim(),
      projectId,
      userId
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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const chats = await conversationService.getChats(
      ASK_AI,
      projectId,
      userId
    );

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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const chats = await conversationService.getChats(
      SUMMARIZE_AI,
      projectId,
      userId
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

    const messages = await conversationService.getChatMessages(
      ASK_AI,
      chatId,
      projectId,
      userId
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

    const messages = await conversationService.getChatMessages(
      SUMMARIZE_AI,
      chatId,
      projectId,
      userId
    );

    res.json({ messages: messages.map(toMessageDto) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to get summarize AI messages",
    });
  }
}

async function deleteAskAIChat(req, res) {
  try {
    const { chatId } = req.params;
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

    await conversationService.deleteChat(
      ASK_AI,
      chatId,
      projectId,
      userId
    );

    res.json({ deletedChatId: chatId });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to delete ask AI chat",
    });
  }
}

async function deleteSummarizeAIChat(req, res) {
  try {
    const { chatId } = req.params;
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

    await conversationService.deleteChat(
      SUMMARIZE_AI,
      chatId,
      projectId,
      userId
    );

    res.json({ deletedChatId: chatId });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to delete summarize AI chat",
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
  deleteAskAIChat,
  deleteSummarizeAIChat,
};