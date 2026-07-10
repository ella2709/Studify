const examsBL = require("../BLs/examBL");

const { sendControllerError, } = require("../helpers/geminiErrorHelper");

function getProjectId(req) {
  const projectId =
    req.body?.projectId ||
    req.query?.projectId ||
    req.params?.projectId;

  if (!projectId || !projectId.trim()) {
    return null;
  }

  return projectId.trim();
}

function getUserId(req) {
  return req.user?.uid || null;
}

async function generateExam(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: "Missing projectId",
      });
    }

    const exam = await examsBL.generateExam({
      ...req.body,
      projectId,
      userId,
    });

    return res.status(201).json(exam);
  } catch (error) {
    console.error("GENERATE EXAM ERROR:", error);

    return sendControllerError(
      res,
      error,
      "Failed to generate exam"
    );
  }
}

async function getProjectExams(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: "Missing projectId",
      });
    }

    const exams = await examsBL.getProjectExams(
      projectId,
      userId
    );

    return res.json({
      exams,
    });
  } catch (error) {
    console.error("GET PROJECT EXAMS ERROR:", error);

    return sendControllerError(
      res,
      error,
      "Failed to get exams"
    );
  }
}

async function getExamById(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    const exam = await examsBL.getExamById(
      req.params.examId,
      userId
    );

    return res.json(exam);
  } catch (error) {
    console.error("GET EXAM BY ID ERROR:", error);

    if (error?.message === "Exam not found") {
      return res.status(404).json({
        error: "Exam not found",
      });
    }

    return sendControllerError(
      res,
      error,
      "Failed to get exam"
    );
  }
}

async function startExam(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    const attempt = await examsBL.startExam(
      req.params.examId,
      userId
    );

    return res.status(201).json(attempt);
  } catch (error) {
    console.error("START EXAM ERROR:", error);

    return sendControllerError(
      res,
      error,
      "Failed to start exam"
    );
  }
}

async function submitExam(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    const result = await examsBL.submitExam(
      req.params.examId,
      {
        ...req.body,
        userId,
      }
    );

    return res.json(result);
  } catch (error) {
    console.error("SUBMIT EXAM ERROR:", error);

    return sendControllerError(
      res,
      error,
      "Failed to submit exam"
    );
  }
}

async function getAttemptById(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    const attempt = await examsBL.getAttemptById(
      req.params.examId,
      req.params.attemptId,
      userId
    );

    return res.json(attempt);
  } catch (error) {
    console.error("GET ATTEMPT BY ID ERROR:", error);

    if (error?.message === "Attempt not found") {
      return res.status(404).json({
        error: "Attempt not found",
      });
    }

    return sendControllerError(
      res,
      error,
      "Failed to get attempt"
    );
  }
}

async function exportExamTxt(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    const txt = await examsBL.exportExamTxt(
      req.params.examId,
      userId
    );

    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exam.txt"
    );

    return res.send(txt);
  } catch (error) {
    console.error("EXPORT EXAM ERROR:", error);

    return sendControllerError(
      res,
      error,
      "Failed to export exam"
    );
  }
}

async function saveAttemptAnswers(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    const attempt = await examsBL.saveAttemptAnswers(
      req.params.examId,
      {
        attemptId: req.params.attemptId,
        userId,
        answers: req.body.answers || {},
      }
    );

    return res.json(attempt);
  } catch (error) {
    console.error("SAVE ATTEMPT ANSWERS ERROR:", error);

    return sendControllerError(
      res,
      error,
      "Failed to save answers"
    );
  }
}

module.exports = {
  generateExam,
  getProjectExams,
  getExamById,
  startExam,
  submitExam,
  getAttemptById,
  exportExamTxt,
  saveAttemptAnswers,
};