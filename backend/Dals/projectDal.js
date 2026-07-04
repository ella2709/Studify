const { db, admin } = require("../config/firebase");
const { toProjectDto } = require("../Dtos/projectDto");

function getProjectsCollection(userId) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  return db.collection("users").doc(userId).collection("projects");
}

async function getProjects(userId) {
  const snapshot = await getProjectsCollection(userId)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => toProjectDto(doc));
}

async function getProjectById(projectId, userId) {
  const doc = await getProjectsCollection(userId).doc(projectId).get();

  if (!doc.exists) {
    return null;
  }

  return toProjectDto(doc);
}

async function createProject(name, userId) {
  const projectRef = getProjectsCollection(userId).doc();

  await projectRef.set({
    name,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const createdDoc = await projectRef.get();

  return toProjectDto(createdDoc);
}

async function deleteProject(projectId, userId) {
  const projectRef = getProjectsCollection(userId).doc(projectId);
  const doc = await projectRef.get();

  if (!doc.exists) {
    throw new Error("Project not found");
  }

  await projectRef.delete();
}

async function renameProject(projectId, name, userId) {
  const projectRef = getProjectsCollection(userId).doc(projectId);
  const doc = await projectRef.get();

  if (!doc.exists) {
    throw new Error("Project not found");
  }

  await projectRef.update({
    name,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await projectRef.get();
  return toProjectDto(updatedDoc);
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  renameProject,
};