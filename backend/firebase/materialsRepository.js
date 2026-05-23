const { db, admin } = require("./firebase");

const DEFAULT_USER_ID = "defaultUser";
const DEFAULT_PROJECT_ID = "defaultProject";

function getMaterialsCollection() {
  return db
    .collection("users")
    .doc(DEFAULT_USER_ID)
    .collection("projects")
    .doc(DEFAULT_PROJECT_ID)
    .collection("materials");
}

async function addMaterial(material) {
  await getMaterialsCollection().doc(material.id).set({
    ...material,
    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function getAllMaterials() {
  const snapshot = await getMaterialsCollection()
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getMaterialById(id) {
  const doc = await getMaterialsCollection().doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

async function getAllMaterialsMetadata() {
  const materials = await getAllMaterials();

  return materials.map((item) => ({
    id: item.id,
    originalName: item.originalName,
    mimeType: item.mimeType,
    size: item.size,
    uploadedAt: item.uploadedAt,
    chunksCount: item.chunks?.length || 0,
  }));
}

async function removeMaterial(id) {
  await getMaterialsCollection().doc(id).delete();
}

module.exports = {
  addMaterial,
  getAllMaterials,
  getMaterialById,
  getAllMaterialsMetadata,
  removeMaterial,
};