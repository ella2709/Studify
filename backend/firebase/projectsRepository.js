const { db, admin } = require("./firebase");

const DEFAULT_USER_ID = "defaultUser";

function getProjectsCollection() {
  return db.collection("users").doc(DEFAULT_USER_ID).collection("projects");
}

async function getProjects() {
  const snapshot = await getProjectsCollection().get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getProjectById(projectId) {
  const doc = await getProjectsCollection().doc(projectId).get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  };
}

async function createProject(name) {
  const projectRef = getProjectsCollection().doc();

  const project = {
    name,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await projectRef.set(project);

  return {
    id: projectRef.id,
    name,
  };
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
};