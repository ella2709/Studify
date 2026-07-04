const questionsBL = require("../BLs/questionBL");
const {questionChatDto, questionMessageDto} = require("../Dtos//questionsChatDto");

function getProjectId(req) {
  const projectId = req.body?.projectId || req.query?.projectId || req.params?.projectId;

  if (!projectId || !projectId.trim()) {
    return null;
  }

  return projectId.trim();
}

function getUserId(req) {
  return req.user?.uid || null;
}

async function createQuestionChat(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const chat = await questionsBL.createChat({
      title: req.body.title,
      projectId,
      userId,
    });

  res.status(201).json({ chat: questionChatDto(chat) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to create question chat",
    });
  }
}

async function getQuestionChats(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const chats = await questionsBL.getChats({ projectId, userId });

    res.json({ chats: chats.map(questionChatDto) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to get question chats",
    });
  }
}

async function getQuestionChatMessages(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const messages = await questionsBL.getChatMessages({
      chatId: req.params.chatId,
      projectId,
      userId,
    });

    res.json({ messages: messages.map(questionMessageDto) });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to get question chat messages",
    });
  }
}

async function deleteQuestionChat(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    await questionsBL.deleteChat({
      chatId: req.params.chatId,
      projectId,
      userId,
    });

    res.json({ deletedChatId: req.params.chatId });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to delete question chat",
    });
  }
}

async function askQuestion(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const result = await questionsBL.askQuestion({
      chatId: req.body.chatId,
      question: req.body.question,
      projectId,
      userId,
    });

    res.json({
      chatId: result.chatId,
      message: questionMessageDto(result.message),
    });
  } catch (err) {
    console.error("ASK QUESTION ERROR:", err);

    res.status(500).json({
      error: err?.message || "Question request failed",
    });
  }
}

module.exports = {
  createQuestionChat,
  getQuestionChats,
  getQuestionChatMessages,
  deleteQuestionChat,
  askQuestion,
};