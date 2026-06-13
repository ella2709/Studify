const express = require("express");
const authHelper = require("../helpers/authHelper");

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
  deleteAskAIChat,
  deleteSummarizeAIChat,
} = require("../controllers/conversationsController");

const router = express.Router();

router.use(authHelper);

router.post("/ask-rag", askRag);
router.post("/summarize-rag", summarizeRag);

router.post("/ask-chats", createAskAIChat);
router.get("/ask-chats", getAskAIChats);
router.get("/ask-chats/:chatId/messages", getAskAIChatMessages);
router.delete("/ask-chats/:chatId", deleteAskAIChat);

router.post("/summarize-chats", createSummarizeAIChat);
router.get("/summarize-chats", getSummarizeAIChats);
router.get("/summarize-chats/:chatId/messages", getSummarizeAIChatMessages);
router.delete("/summarize-chats/:chatId", deleteSummarizeAIChat);

module.exports = router;