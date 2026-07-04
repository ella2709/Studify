const summariesBL = require("../BLs/summaryBL");

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

async function generateSummary(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const summary = await summariesBL.generateSummary({
      instruction: req.body.instruction || req.body.topic,
      projectId,
      userId,
    });

    res.status(201).json({ summary });
  } catch (err) {
    console.error("GENERATE SUMMARY ERROR:", err);

    res.status(500).json({
      error: err?.message || "Summary generation failed",
    });
  }
}

async function getProjectSummaries(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const summaries = await summariesBL.getProjectSummaries({
      projectId,
      userId,
    });

    res.json({ summaries });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to get summaries",
    });
  }
}

async function getSummaryById(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const summary = await summariesBL.getSummaryById({
      summaryId: req.params.summaryId,
      projectId,
      userId,
    });

    res.json({ summary });
  } catch (err) {
    res.status(404).json({
      error: err?.message || "Summary not found",
    });
  }
}

async function deleteSummary(req, res) {
  try {
    const userId = getUserId(req);
    const projectId = getProjectId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    await summariesBL.deleteSummary({
      summaryId: req.params.summaryId,
      projectId,
      userId,
    });

    res.json({ deletedSummaryId: req.params.summaryId });
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Failed to delete summary",
    });
  }
}

module.exports = {
  generateSummary,
  getProjectSummaries,
  getSummaryById,
  deleteSummary,
};