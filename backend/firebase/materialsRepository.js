const { db, admin } = require("./firebase");

const DEFAULT_USER_ID = "defaultUser";
const DEFAULT_PROJECT_ID = "defaultProject";

function getMaterialsCollection(projectId = DEFAULT_PROJECT_ID) {
  return db
    .collection("users")
    .doc(DEFAULT_USER_ID)
    .collection("projects")
    .doc(projectId)
    .collection("materials");
}

async function addMaterial(material, projectId = DEFAULT_PROJECT_ID) {
  await getMaterialsCollection(projectId).doc(material.id).set({
    ...material,
    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function getAllMaterials(projectId = DEFAULT_PROJECT_ID) {
  const snapshot = await getMaterialsCollection(projectId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getMaterialById(id, projectId = DEFAULT_PROJECT_ID) {
  const doc = await getMaterialsCollection(projectId).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

async function getAllMaterialsMetadata(projectId = DEFAULT_PROJECT_ID) {
  const materials = await getAllMaterials(projectId);

  return materials.map((item) => ({
    id: item.id,
    originalName: item.originalName,
    mimeType: item.mimeType,
    size: item.size,
    uploadedAt: item.uploadedAt,
    chunksCount: item.chunks?.length || 0,
  }));
}

async function removeMaterial(id, projectId = DEFAULT_PROJECT_ID) {
  await getMaterialsCollection(projectId).doc(id).delete();
}

module.exports = {
  addMaterial,
  getAllMaterials,
  getMaterialById,
  getAllMaterialsMetadata,
  removeMaterial,
};