const materialBL = require("../BLs/materialBL");

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

async function uploadMaterials(req, res) {
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

    const files = await materialBL.uploadMaterials({
      files: req.files,
      projectId,
      userId,
    });

    return res.status(201).json({
      message: "Files uploaded successfully",
      files,
    });
  } catch (err) {
    console.error("UPLOAD MATERIALS ERROR:", err);

    return sendControllerError(
      res,
      err,
      "File upload failed"
    );
  }
}

async function getMaterials(req, res) {
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

    const files = await materialBL.getMaterials({
      projectId,
      userId,
    });

    return res.json({
      files,
    });
  } catch (err) {
    console.error("GET MATERIALS ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Failed to get materials"
    );
  }
}

async function getMaterialById(req, res) {
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

    const material = await materialBL.getMaterialById({
      id: req.params.id,
      projectId,
      userId,
    });

    return res.json({
      material,
    });
  } catch (err) {
    console.error("GET MATERIAL BY ID ERROR:", err);

    if (err?.message === "Material not found") {
      return res.status(404).json({
        error: "Material not found",
      });
    }

    return sendControllerError(
      res,
      err,
      "Failed to get material"
    );
  }
}

async function removeMaterial(req, res) {
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

    await materialBL.removeMaterial({
      id: req.params.id,
      projectId,
      userId,
    });

    return res.json({
      message: "File deleted successfully",
      id: req.params.id,
    });
  } catch (err) {
    console.error("REMOVE MATERIAL ERROR:", err);

    return sendControllerError(
      res,
      err,
      "Failed to delete material"
    );
  }
}

module.exports = {
  uploadMaterials,
  getMaterials,
  getMaterialById,
  removeMaterial,
};
