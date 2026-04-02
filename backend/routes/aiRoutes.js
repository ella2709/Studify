const express = require("express");
const {
  askRag,
  summarizeRag,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/ask-rag", askRag);
router.post("/summarize-rag", summarizeRag);

module.exports = router;