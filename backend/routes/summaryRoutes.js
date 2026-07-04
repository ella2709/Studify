const express = require("express");
const authHelper = require("../helpers/authHelper");

const {
  generateSummary,
  getProjectSummaries,
  getSummaryById,
  deleteSummary,
} = require("../controllers/summariesController");

const router = express.Router();

router.use(authHelper);

router.post("/generate", generateSummary);
router.get("/project/:projectId", getProjectSummaries);
router.get("/:summaryId", getSummaryById);
router.delete("/:summaryId", deleteSummary);

module.exports = router;