const projectsRepository = require("../firebase/projectsRepository");

async function getProjects(req, res) {
  try {
    const projects = await projectsRepository.getProjects();
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

    const project = await projectsRepository.getProjectById(projectId);

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

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Missing project name" });
    }

    const project = await projectsRepository.createProject(name.trim());

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