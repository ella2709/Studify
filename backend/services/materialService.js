const { db, admin } = require("../firebase");
const { toMaterialDto } = require("../Dtos/materialDto");

function getMaterialsCollection(userId, projectId) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  if (!projectId) {
    throw new Error("Missing projectId");
  }

  return db
    .collection("users")
    .doc(userId)
    .collection("projects")
    .doc(projectId)
    .collection("materials");
}

async function addMaterial(material, projectId, userId) {
  const materialRef = getMaterialsCollection(userId, projectId).doc(material.id);

  await materialRef.set({
    ...material,
    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const createdDoc = await materialRef.get();
  return toMaterialDto(createdDoc);
}

async function getAllMaterials(projectId, userId) {
  const snapshot = await getMaterialsCollection(userId, projectId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getMaterialById(id, projectId, userId) {
  const doc = await getMaterialsCollection(userId, projectId).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

async function getAllMaterialsMetadata(projectId, userId) {
  const snapshot = await getMaterialsCollection(userId, projectId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => toMaterialDto(doc));
}

async function removeMaterial(id, projectId, userId) {
  await getMaterialsCollection(userId, projectId).doc(id).delete();
}

module.exports = {
  addMaterial,
  getAllMaterials,
  getMaterialById,
  getAllMaterialsMetadata,
  removeMaterial,
};