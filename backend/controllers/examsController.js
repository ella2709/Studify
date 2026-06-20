const examsService = require("../services/examsService");

function getProjectId(req) {
  const projectId = req.body?.projectId || req.query?.projectId || req.params?.projectId;

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

    const exam = await examsService.generateExam({
      ...req.body,
      projectId,
      userId,
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error("Generate exam error:", error);
    res.status(500).json({ error: error.message });
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

    const exams = await examsService.getProjectExams(projectId, userId);
    res.json({ exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getExamById(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const exam = await examsService.getExamById(req.params.examId, userId);
    res.json(exam);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function startExam(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const attempt = await examsService.startExam(req.params.examId, userId);
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function submitExam(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const result = await examsService.submitExam(req.params.examId, {
      ...req.body,
      userId,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAttemptById(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const attempt = await examsService.getAttemptById(
      req.params.examId,
      req.params.attemptId,
      userId
    );

    res.json(attempt);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function exportExamTxt(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const txt = await examsService.exportExamTxt(req.params.examId, userId);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=exam.txt");
    res.send(txt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function saveAttemptAnswers(req, res) {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        error: "Missing userId",
      });
    }

    const attempt = await examsService.saveAttemptAnswers(
      req.params.examId,
      {
        attemptId: req.params.attemptId,
        userId,
        answers: req.body.answers || {},
      }
    );

    res.json(attempt);
  } catch (error) {
    res.status(500).json({
      error: error.message,
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