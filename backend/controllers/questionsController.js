const questionsBL = require("../BLs/questionBL");
const { questionChatDto, questionMessageDto,} = require("../Dtos/questionsChatDto");

const { sendControllerError, } = require("../helpers/geminiErrorHelper");

function getProjectId(req) {
  const projectId =
    req.body?.projectId ||
    req.query?.projectId ||
    req.params?.projectId;

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
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: "Missing projectId",
      });
    }

    const chat = await questionsBL.createChat({
      title: req.body.title,
      projectId,
      userId,
    });

    return res.status(201).json({
      chat: questionChatDto(chat),
    });
  } catch (err) {
    console.error("CREATE QUESTION CHAT ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Failed to create question chat"
    );
  }
}

async function getQuestionChats(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: "Missing projectId",
      });
    }

    const chats = await questionsBL.getChats({
      projectId,
      userId,
    });

    return res.json({
      chats: chats.map(questionChatDto),
    });
  } catch (err) {
    console.error("GET QUESTION CHATS ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Failed to get question chats"
    );
  }
}

async function getQuestionChatMessages(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: "Missing projectId",
      });
    }

    const messages = await questionsBL.getChatMessages({
      chatId: req.params.chatId,
      projectId,
      userId,
    });

    return res.json({
      messages: messages.map(questionMessageDto),
    });
  } catch (err) {
    console.error("GET QUESTION CHAT MESSAGES ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Failed to get question chat messages"
    );
  }
}

async function deleteQuestionChat(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: "Missing projectId",
      });
    }

    await questionsBL.deleteChat({
      chatId: req.params.chatId,
      projectId,
      userId,
    });

    return res.json({
      deletedChatId: req.params.chatId,
    });
  } catch (err) {
    console.error("DELETE QUESTION CHAT ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Failed to delete question chat"
    );
  }
}

async function askQuestion(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: "Missing projectId",
      });
    }

    const result = await questionsBL.askQuestion({
      chatId: req.body.chatId,
      question: req.body.question,
      projectId,
      userId,
    });

    return res.json({
      success: result.success,
      saveToDb: result.saveToDb,
      chatId: result.chatId || req.body.chatId,
      message: questionMessageDto(result.message),
    });
  } catch (err) {
    console.error("ASK QUESTION ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Question request failed"
    );
  }
}

module.exports = {
  createQuestionChat,
  getQuestionChats,
  getQuestionChatMessages,
  deleteQuestionChat,
  askQuestion,
};
