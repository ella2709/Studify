const materialDal = require("../Dals/materialDal");
const summaryDal = require("../Dals/summaryDal");

const { retrieveRelevantChunks } = require("../helpers/ragHelper");
const { generateSummaryFromContext } = require("../helpers/summaryHelper");
const { buildUniqueSources } = require("../utils/fileUtils");

async function generateSummary({ instruction, projectId, userId }) {
  if (!instruction || !instruction.trim()) {
    throw new Error("Missing summary instruction");
  }

  const cleanInstruction = instruction.trim();

  const materials = await materialDal.getAllMaterials(projectId, userId);

  if (!materials || materials.length === 0) {
    throw new Error("No uploaded materials found");
  }

  const relevantChunks = await retrieveRelevantChunks(
    materials,
    cleanInstruction,
    8
  );

  let summaryText;
  let sources;

  if (relevantChunks.length === 0) {
    summaryText =
      "No relevant information was found in the uploaded study materials for this topic.";
    sources = [];
  } else {
    summaryText = await generateSummaryFromContext(
      cleanInstruction,
      relevantChunks
    );

    sources = buildUniqueSources(relevantChunks);
  }

  const title =
    cleanInstruction.length > 60
      ? `${cleanInstruction.slice(0, 60)}...`
      : cleanInstruction;

  const summaryRef = summaryDal.createSummaryRef(projectId, userId);

  const summaryFile = await summaryDal.uploadSummaryFile(
    projectId,
    summaryRef.id,
    summaryText
  );

  return summaryDal.saveSummary(
    summaryRef,
    {
      title,
      instruction: cleanInstruction,
      file: summaryFile,
      sources,
      status: "completed",
    },
    projectId,
    userId
  );
}

async function getProjectSummaries({ projectId, userId }) {
  return summaryDal.getProjectSummaries(projectId, userId);
}

async function getSummaryById({ summaryId, projectId, userId }) {
  if (!summaryId) {
    throw new Error("Missing summaryId");
  }

  const summary = await summaryDal.getSummaryById(summaryId, projectId, userId);

  if (!summary) {
    throw new Error("Summary not found");
  }

  return summary;
}

async function deleteSummary({ summaryId, projectId, userId }) {
  if (!summaryId) {
    throw new Error("Missing summaryId");
  }

  await summaryDal.deleteSummary(summaryId, projectId, userId);

  return { id: summaryId };
}

module.exports = {
  generateSummary,
  getProjectSummaries,
  getSummaryById,
  deleteSummary,
};