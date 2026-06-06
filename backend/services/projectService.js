const { db, admin } = require("../firebase");
const { toProjectDto } = require("../Dtos/projectDto");

const DEFAULT_USER_ID = "defaultUser";

function getProjectsCollection() {
  return db
    .collection("users")
    .doc(DEFAULT_USER_ID)
    .collection("projects");
  
}

async function getProjects() {
  const snapshot = await getProjectsCollection().get();
  return snapshot.docs.map((doc) => toProjectDto(doc));
}

async function getProjectById(projectId) {
  const doc = await getProjectsCollection().doc(projectId).get();

  if (!doc.exists) {
    return null;
  }

  return toProjectDto(doc);
}

async function createProject(name) {
  const projectRef = getProjectsCollection().doc();

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