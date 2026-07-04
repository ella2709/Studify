const { db, admin } = require("../config/firebase");
const { summaryDto } = require("../Dtos/summaryDto");

function getSummariesCollection(userId, projectId) {
  if (!userId) throw new Error("Missing userId");
  if (!projectId) throw new Error("Missing projectId");

  return db
    .collection("users")
    .doc(userId)
    .collection("projects")
    .doc(projectId)
    .collection("summaries");
}

function createSummaryRef(projectId, userId) {
  return getSummariesCollection(userId, projectId).doc();
}

async function uploadSummaryFile(projectId, summaryId, summaryText) {
  const bucket = admin.storage().bucket();

  const fileName = `summary-${Date.now()}.txt`;
  const storagePath = `projects/${projectId}/summaries/${summaryId}/${fileName}`;
  const file = bucket.file(storagePath);

  await file.save(summaryText, {
    contentType: "text/plain; charset=utf-8",
    metadata: {
      contentDisposition: `attachment; filename="${fileName}"`,
    },
  });

  const [downloadUrl] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2035",
  });

  return {
    fileName,
    storagePath,
    downloadUrl,
    contentType: "text/plain",
  };
}

async function saveSummary(summaryRef, summaryData, projectId, userId) {
  await summaryRef.set({
    ...summaryData,
    projectId,
    userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const createdDoc = await summaryRef.get();

  return summaryDto(createdDoc);
}

async function getProjectSummaries(projectId, userId) {
  const snapshot = await getSummariesCollection(userId, projectId)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => summaryDto(doc));
}

async function getSummaryById(summaryId, projectId, userId) {
  const doc = await getSummariesCollection(userId, projectId)
    .doc(summaryId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return summaryDto(doc);
}

async function deleteSummaryFile(storagePath) {
  if (!storagePath) return;

  const bucket = admin.storage().bucket();
  const file = bucket.file(storagePath);

  await file.delete({ ignoreNotFound: true });
}

async function deleteSummary(summaryId, projectId, userId) {
  const summaryRef = getSummariesCollection(userId, projectId).doc(summaryId);
  const summaryDoc = await summaryRef.get();

  if (!summaryDoc.exists) {
    throw new Error("Summary not found");
  }

  const summaryData = summaryDoc.data();

  if (summaryData.file?.storagePath) {
    await deleteSummaryFile(summaryData.file.storagePath);
  }

  await summaryRef.delete();

  return {
    id: summaryId,
    ...summaryData,
  };
}

module.exports = {
  createSummaryRef,
  uploadSummaryFile,
  saveSummary,
  getProjectSummaries,
  getSummaryById,
  deleteSummary,
};