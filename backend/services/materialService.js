const { db, admin } = require("../firebase");
const { toMaterialDto } = require("../Dtos/materialDto");

const DEFAULT_USER_ID = "defaultUser";

function getMaterialsCollection(projectId) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  return db
    .collection("users")
    .doc(DEFAULT_USER_ID)
    .collection("projects")
    .doc(projectId)
    .collection("materials");
}

async function addMaterial(material, projectId) {
  const materialRef = getMaterialsCollection(projectId).doc(material.id);

  await materialRef.set({
    ...material,
    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const createdDoc = await materialRef.get();
  return toMaterialDto(createdDoc);
}

async function getAllMaterials(projectId) {
  const snapshot = await getMaterialsCollection(projectId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getMaterialById(id, projectId) {
  const doc = await getMaterialsCollection(projectId).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

async function getAllMaterialsMetadata(projectId) {
  const snapshot = await getMaterialsCollection(projectId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => toMaterialDto(doc));
}

async function removeMaterial(id, projectId) {
  await getMaterialsCollection(projectId).doc(id).delete();
}

module.exports = {
  addMaterial,
  getAllMaterials,
  getMaterialById,
  getAllMaterialsMetadata,
  removeMaterial,
};