const summariesBL = require("../BLs/summaryBL");

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

async function generateSummary(req, res) {
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

    const summary = await summariesBL.generateSummary({
      instruction: req.body.instruction || req.body.topic,
      projectId,
      userId,
    });

    return res.status(201).json({
      summary,
    });
  } catch (err) {
    console.error("GENERATE SUMMARY ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Summary generation failed"
    );
  }
}

async function getProjectSummaries(req, res) {
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

    const summaries = await summariesBL.getProjectSummaries({
      projectId,
      userId,
    });

    return res.json({
      summaries,
    });
  } catch (err) {
    console.error("GET PROJECT SUMMARIES ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Failed to get summaries"
    );
  }
}

async function getSummaryById(req, res) {
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

    const summary = await summariesBL.getSummaryById({
      summaryId: req.params.summaryId,
      projectId,
      userId,
    });

    return res.json({
      summary,
    });
  } catch (err) {
    console.error("GET SUMMARY BY ID ERROR:", err);

    if (err?.message === "Summary not found") {
      return res.status(404).json({
        error: "Summary not found",
      });
    }

    return sendControllerError(
      res,
      err,
      "Failed to get summary"
    );
  }
}

async function deleteSummary(req, res) {
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

    await summariesBL.deleteSummary({
      summaryId: req.params.summaryId,
      projectId,
      userId,
    });

    return res.json({
      deletedSummaryId: req.params.summaryId,
    });
  } catch (err) {
    console.error("DELETE SUMMARY ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Failed to delete summary"
    );
  }
}

module.exports = {
  generateSummary,
  getProjectSummaries,
  getSummaryById,
  deleteSummary,
};
