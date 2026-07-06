const questionDal = require("../Dals/questionDal");
const materialDal = require("../Dals/materialDal");

const { retrieveRelevantChunks } = require("../helpers/ragHelper");
const { generateAnswerFromContext } = require("../helpers/questionHelper");
const { buildUniqueSources } = require("../utils/fileUtils");

async function createChat({ title, projectId, userId }) {
  if (!title || !title.trim()) {
    throw new Error("Missing chat title");
  }

  return questionDal.createChat(title.trim(), projectId, userId);
}

async function getChats({ projectId, userId }) {
  return questionDal.getChats(projectId, userId);
}

async function getChatMessages({ chatId, projectId, userId }) {
  if (!chatId) {
    throw new Error("Missing chatId");
  }

  return questionDal.getChatMessages(chatId, projectId, userId);
}

async function deleteChat({ chatId, projectId, userId }) {
  if (!chatId) {
    throw new Error("Missing chatId");
  }

  return questionDal.deleteChat(chatId, projectId, userId);
}

function buildTemporaryAiMessage(content) {
  return {
    success: false,
    saveToDb: false,
    message: {
      role: "assistant",
      type: "text",
      content,
      sources: [],
    },
  };
}


async function askQuestion({ chatId, question, projectId, userId }) {
  if (!chatId) {
    throw new Error("Missing chatId");
  }

  if (!question || !question.trim()) {
    return buildTemporaryAiMessage(
      "Please enter a study-related question."
    );
  }

  const cleanQuestion = question.trim();
  const INSUFFICIENT_INFORMATION_MESSAGE = "I couldn't find enough information in the uploaded study materials to answer this question.";
  const MIN_QUESTION_LENGTH = 10;
  const MIN_RELEVANT_CHUNKS = 1;

  if (cleanQuestion.length < MIN_QUESTION_LENGTH) {
    return buildTemporaryAiMessage(
      "Your question is too short. Please enter a more detailed study-related question."
    );
  }

  const materials = await materialDal.getAllMaterials(projectId, userId);

  if (!materials || materials.length === 0) {
    return buildTemporaryAiMessage(
      "No study materials were found. Please upload study materials before asking a question."
    );
  }

  const relevantChunks = await retrieveRelevantChunks(
    materials,
    cleanQuestion,
    5
  );

  const answer = await generateAnswerFromContext(cleanQuestion, relevantChunks);

  if (!answer || !answer.trim()) {
    return buildTemporaryAiMessage(
      "I couldn't generate a study answer from your question. Please enter a different or more specific question."
    );
  }
  
  if (relevantChunks.length < MIN_RELEVANT_CHUNKS) {
    return buildTemporaryAiMessage("I couldn't find enough information about this topic in your uploaded study materials. Please upload additional study materials related to this topic and try again.");
  }

  if (answer.trim() === INSUFFICIENT_INFORMATION_MESSAGE) {
    return buildTemporaryAiMessage(answer.trim());
  }


  await questionDal.addMessageToChat(
    chatId,
    {
      role: "user",
      type: "text",
      content: cleanQuestion,
    },
    projectId,
    userId
  );

  const assistantMessage = await questionDal.addMessageToChat(
    chatId,
    {
      role: "assistant",
      type: "text",
      content: answer,
      sources: buildUniqueSources(relevantChunks),
    },
    projectId,
    userId
  );

  return {
    success: true,
    saveToDb: true,
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