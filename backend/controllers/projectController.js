const projectService = require("../services/projectService");

async function getProjects(req, res) {
  try {
    const userId = req.user.uid;

    const projects = await projectService.getProjects(userId);

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
    const { projectId } = req.params;
    const userId = req.user.uid;

    const project = await projectService.getProjectById(projectId, userId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

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
    const { name } = req.body;
    const userId = req.user.uid;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Missing project name" });
    }

    const project = await projectService.createProject(name.trim(), userId);

    res.status(201).json({ project });
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({
      error: err?.message || "Failed to create project",
    });
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
};