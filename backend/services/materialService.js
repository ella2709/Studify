const { db, admin } = require("../config/firebase");
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

  async function addMaterialWithChunks(material, chunks, projectId, userId) {
  const materialRef = getMaterialsCollection(userId, projectId).doc(material.id);

  await materialRef.set({
    id: material.id,
    originalName: material.originalName,
    mimeType: material.mimeType,
    size: material.size,
    chunksCount: chunks.length,
    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const CHUNKS_PER_BATCH = 5;

  for (let i = 0; i < chunks.length; i += CHUNKS_PER_BATCH) {
    const batch = db.batch();
    const batchChunks = chunks.slice(i, i + CHUNKS_PER_BATCH);

    batchChunks.forEach((chunk) => {
      const chunkRef = materialRef.collection("chunks").doc(chunk.id);

      batch.set(chunkRef, {
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        embedding: chunk.embedding,
      });
    });

    await batch.commit();
  }

  const createdDoc = await materialRef.get();
  return toMaterialDto(createdDoc);
}

async function getChunksForMaterial(materialRef) {
  const snapshot = await materialRef
    .collection("chunks")
    .orderBy("chunkIndex", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getAllMaterials(projectId, userId) {
  const snapshot = await getMaterialsCollection(userId, projectId)
    .orderBy("uploadedAt", "desc")
    .get();

  const materials = [];

  for (const doc of snapshot.docs) {
    const chunks = await getChunksForMaterial(doc.ref);

    materials.push({
      id: doc.id,
      ...doc.data(),
      chunks,
    });
  }

  return materials;
}

async function getMaterialById(id, projectId, userId) {
  const doc = await getMaterialsCollection(userId, projectId).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const chunks = await getChunksForMaterial(doc.ref);

  return {
    id: doc.id,
    ...doc.data(),
    chunks,
  };
}

async function getAllMaterialsMetadata(projectId, userId) {
  const snapshot = await getMaterialsCollection(userId, projectId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => toMaterialDto(doc));
}

async function removeMaterial(id, projectId, userId) {
  const materialRef = getMaterialsCollection(userId, projectId).doc(id);

  const chunksSnapshot = await materialRef.collection("chunks").get();

  const CHUNKS_PER_BATCH = 5;

  for (let i = 0; i < chunksSnapshot.docs.length; i += CHUNKS_PER_BATCH) {
    const batch = db.batch();
    const chunkDocs = chunksSnapshot.docs.slice(i, i + CHUNKS_PER_BATCH);

    chunkDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  await materialRef.delete();
}

module.exports = {
  addMaterialWithChunks,
  getAllMaterials,
  getMaterialById,
  getAllMaterialsMetadata,
  removeMaterial,
};