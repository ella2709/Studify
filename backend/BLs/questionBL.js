const questionsChatDal = require("../Dals/questionsChatDal");
const materialDal = require("../Dals/materialDal");

const { retrieveRelevantChunks } = require("../helpers/ragHelper");
const { generateAnswerFromContext } = require("../helpers/questionHelper");
const { buildUniqueSources } = require("../utils/fileUtils");

async function createChat({ title, projectId, userId }) {
  if (!title || !title.trim()) {
    throw new Error("Missing chat title");
  }

  return questionsChatDal.createChat(title.trim(), projectId, userId);
}

async function getChats({ projectId, userId }) {
  return questionsChatDal.getChats(projectId, userId);
}

async function getChatMessages({ chatId, projectId, userId }) {
  if (!chatId) {
    throw new Error("Missing chatId");
  }

  return questionsChatDal.getChatMessages(chatId, projectId, userId);
}

async function deleteChat({ chatId, projectId, userId }) {
  if (!chatId) {
    throw new Error("Missing chatId");
  }

  return questionsChatDal.deleteChat(chatId, projectId, userId);
}

async function askQuestion({ chatId, question, projectId, userId }) {
  if (!chatId) {
    throw new Error("Missing chatId");
  }

  if (!question || !question.trim()) {
    throw new Error("Missing question");
  }

  const cleanQuestion = question.trim();

  await questionsChatDal.addMessageToChat(
    chatId,
    {
      role: "user",
      type: "text",
      content: cleanQuestion,
    },
    projectId,
    userId
  );

  const materials = await materialDal.getAllMaterials(projectId, userId);

  if (!materials || materials.length === 0) {
    throw new Error("No uploaded materials found");
  }

  const relevantChunks = await retrieveRelevantChunks(
    materials,
    cleanQuestion,
    5
  );

  let answer;
  let sources;

  if (relevantChunks.length === 0) {
    answer = "The answer was not found in the uploaded study materials.";
    sources = [];
  } else {
    answer = await generateAnswerFromContext(cleanQuestion, relevantChunks);
    sources = buildUniqueSources(relevantChunks);
  }

  const assistantMessage = await questionsChatDal.addMessageToChat(
    chatId,
    {
      role: "assistant",
      type: "text",
      content: answer,
      sources,
    },
    projectId,
    userId
  );

  return {
    chatId,
    message: assistantMessage,
  };
}

module.exports = {
  createChat,
  getChats,
  getChatMessages,
  deleteChat,
  askQuestion,
};