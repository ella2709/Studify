const projectDal = require("../Dals/projectDal");

async function getProjects({ userId }) {
  return projectDal.getProjects(userId);
}

async function getProjectById({ projectId, userId }) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  const project = await projectDal.getProjectById(projectId, userId);

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

async function createProject({ name, userId }) {
  if (!name || !name.trim()) {
    throw new Error("Missing project name");
  }

  return projectDal.createProject(name.trim(), userId);
}

async function deleteProject({ projectId, userId }) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  await projectDal.deleteProject(projectId, userId);

  return { id: projectId };
}

async function renameProject({ projectId, name, userId }) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  if (!name || !name.trim()) {
    throw new Error("Missing project name");
  }

  return projectDal.renameProject(projectId, name.trim(), userId);
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  renameProject,
};