const { db, admin } = require("../firebase");
const { toProjectDto } = require("../Dtos/projectDto");

function getProjectsCollection(userId) {
  return db
    .collection("users")
    .doc(userId)
    .collection("projects");
}

async function getProjects(userId) {
  const snapshot = await getProjectsCollection(userId).get();

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

module.exports = {
  getProjects,
  getProjectById,
  createProject,
};