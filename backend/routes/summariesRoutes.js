const express = require("express");
const authHelper = require("../helpers/authHelper");

const {
  summarizeRag,
} = require("../controllers/aiController");

const {
  createSummarizeAIChat,
  getSummarizeAIChats,
  getSummarizeAIChatMessages,
  deleteSummarizeAIChat,
} = require("../controllers/conversationsController");

const router = express.Router();

router.use(authHelper);

router.post("/summarize-rag", summarizeRag);

router.post("/summarize-chats", createSummarizeAIChat);
router.get("/summarize-chats", getSummarizeAIChats);
router.get("/summarize-chats/:chatId/messages", getSummarizeAIChatMessages);
router.delete("/summarize-chats/:chatId", deleteSummarizeAIChat);

module.exports = router;