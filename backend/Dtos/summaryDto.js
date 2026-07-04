const { formatFirestoreDate } = require("../utils/dateUtils");

function summaryDto(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    projectId: data.projectId,
    userId: data.userId,
    title: data.title || "Generated Summary",
    instruction: data.instruction || "",
    file: data.file || null,
    sources: data.sources || [],
    status: data.status || "completed",
    createdAt: formatFirestoreDate(data.createdAt),
    updatedAt: formatFirestoreDate(data.updatedAt || data.createdAt),
  };
}

module.exports = {
  summaryDto,
};