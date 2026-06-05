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
  console.log("Reading users/defaultUser/projects");

  const userDoc = await db.collection("users").doc("defaultUser").get();
  console.log("defaultUser exists?", userDoc.exists);
  console.log("defaultUser data:", userDoc.data());

  const collections = await db.collection("users").doc("defaultUser").listCollections();
  console.log("sub collections:", collections.map((c) => c.id));

  const snapshot = await getProjectsCollection().get();
  console.log("Projects count:", snapshot.docs.length);
  console.log("Project ids:", snapshot.docs.map((doc) => doc.id));

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