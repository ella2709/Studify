const examsBL = require("../BLs/examBL");

function getProjectId(req) {
  const projectId =
    req.body?.projectId || req.query?.projectId || req.params?.projectId;

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
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const exam = await examsBL.generateExam({
      ...req.body,
      projectId,
      userId,
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error("Generate exam error:", error);

    res.status(500).json({
      error: error?.message || "Failed to generate exam",
    });
  }
}

async function getProjectExams(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const exams = await examsBL.getProjectExams(projectId, userId);

    res.json({ exams });
  } catch (error) {
    res.status(500).json({
      error: error?.message || "Failed to get exams",
    });
  }
}

async function getExamById(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const exam = await examsBL.getExamById(req.params.examId, userId);

    res.json(exam);
  } catch (error) {
    res.status(404).json({
      error: error?.message || "Exam not found",
    });
  }
}

async function startExam(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const attempt = await examsBL.startExam(req.params.examId, userId);

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({
      error: error?.message || "Failed to start exam",
    });
  }
}

async function submitExam(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const result = await examsBL.submitExam(req.params.examId, {
      ...req.body,
      userId,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error?.message || "Failed to submit exam",
    });
  }
}

async function getAttemptById(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const attempt = await examsBL.getAttemptById(
      req.params.examId,
      req.params.attemptId,
      userId
    );

    res.json(attempt);
  } catch (error) {
    res.status(404).json({
      error: error?.message || "Attempt not found",
    });
  }
}

async function exportExamTxt(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const txt = await examsBL.exportExamTxt(req.params.examId, userId);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=exam.txt");
    res.send(txt);
  } catch (error) {
    res.status(500).json({
      error: error?.message || "Failed to export exam",
    });
  }
}

async function saveAttemptAnswers(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const attempt = await examsBL.saveAttemptAnswers(req.params.examId, {
      attemptId: req.params.attemptId,
      userId,
      answers: req.body.answers || {},
    });

    res.json(attempt);
  } catch (error) {
    res.status(500).json({
      error: error?.message || "Failed to save answers",
    });
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