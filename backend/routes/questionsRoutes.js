const express = require("express");
const authHelper = require("../helpers/authHelper");

const {
  askRag,
} = require("../controllers/aiController");

const {
  createAskAIChat,
  getAskAIChats,
  getAskAIChatMessages,
  deleteAskAIChat,
} = require("../controllers/conversationsController");

const router = express.Router();

router.use(authHelper);

router.post("/ask-rag", askRag);

router.post("/ask-chats", createAskAIChat);
router.get("/ask-chats", getAskAIChats);
router.get("/ask-chats/:chatId/messages", getAskAIChatMessages);
router.delete("/ask-chats/:chatId", deleteAskAIChat);


module.exports = router;