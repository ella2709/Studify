const express = require("express");

const {
  createAskAIChat,
  createSummarizeAIChat,
  askRag,
  summarizeRag,
  getAskAIChats,
  getSummarizeAIChats,
  getAskAIChatMessages,
  getSummarizeAIChatMessages,
} = require("../controllers/aiController");

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