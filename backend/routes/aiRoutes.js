const express = require("express");

const {
  askRag,
  summarizeRag,
} = require("../controllers/aiController");

const {
  createAskAIChat,
  createSummarizeAIChat,
  getAskAIChats,
  getSummarizeAIChats,
  getAskAIChatMessages,
  getSummarizeAIChatMessages,
} = require("../controllers/conversationsController");

const router = express.Router();

router.post("/ask-rag", askRag);
router.post("/summarize-rag", summarizeRag);

router.post("/ask-chats", createAskAIChat);
router.get("/ask-chats", getAskAIChats);
router.get("/ask-chats/:chatId/messages", getAskAIChatMessages);

router.post("/summarize-chats", createSummarizeAIChat);
router.get("/summarize-chats", getSummarizeAIChats);
router.get("/summarize-chats/:chatId/messages", getSummarizeAIChatMessages);

module.exports = router;