const projectBL = require("../BLs/projectBL");

function getUserId(req) {
  return req.user?.uid || null;
}

async function getProjects(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const projects = await projectBL.getProjects({ userId });

    res.json({ projects });
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to get projects",
    });
  }
}

async function getProjectById(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const project = await projectBL.getProjectById({
      projectId: req.params.projectId,
      userId,
    });

    res.json({ project });
  } catch (err) {
    console.error("GET PROJECT ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to get project",
    });
  }
}

async function createProject(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const project = await projectBL.createProject({
      name: req.body.name,
      userId,
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to create project",
    });
  }
}

async function deleteProject(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    await projectBL.deleteProject({
      projectId: req.params.projectId,
      userId,
    });

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error("DELETE PROJECT ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to delete project",
    });
  }
}

async function renameProject(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const project = await projectBL.renameProject({
      projectId: req.params.projectId,
      name: req.body.name,
      userId,
    });

    res.status(200).json({ project });
  } catch (err) {
    console.error("RENAME PROJECT ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to rename project",
    });
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  renameProject,
};