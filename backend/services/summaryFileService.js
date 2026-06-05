const { admin } = require("../firebase");

async function uploadSummaryTxt(projectId, chatId, summaryText) {
  const bucket = admin.storage().bucket();

  const fileName = `summary-${Date.now()}.txt`;
  const storagePath = `projects/${projectId}/summaries/${chatId}/${fileName}`;
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

module.exports = {
  uploadSummaryTxt,
};