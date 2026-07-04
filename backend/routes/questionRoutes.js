const express = require("express");
const authHelper = require("../helpers/authHelper");

const {
  askQuestion,
  createQuestionChat,
  getQuestionChats,
  getQuestionChatMessages,
  deleteQuestionChat,
} = require("../controllers/questionsController");

const router = express.Router();

router.use(authHelper);

router.post("/ask-rag", askQuestion);

router.post("/ask-chats", createQuestionChat);
router.get("/ask-chats", getQuestionChats);
router.get("/ask-chats/:chatId/messages", getQuestionChatMessages);
router.delete("/ask-chats/:chatId", deleteQuestionChat);

module.exports = router;