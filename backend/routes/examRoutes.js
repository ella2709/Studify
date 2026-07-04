const express = require("express");
const authHelper = require("../helpers/authHelper");
const examsController = require("../controllers/examsController");

const router = express.Router();

router.use(authHelper);

router.post("/generate", examsController.generateExam);
router.get("/project/:projectId", examsController.getProjectExams);
router.get("/:examId", examsController.getExamById);

router.post("/:examId/start", examsController.startExam);
router.post("/:examId/submit", examsController.submitExam);

router.get("/:examId/attempts/:attemptId", examsController.getAttemptById);
router.get("/:examId/export/txt", examsController.exportExamTxt);

router.patch(
  "/:examId/attempts/:attemptId/answers",
  examsController.saveAttemptAnswers
);

module.exports = router;