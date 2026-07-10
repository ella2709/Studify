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

  const INSUFFICIENT_INFORMATION_MESSAGE =
    "No relevant information was found in the uploaded study materials for this topic.";

  const MIN_INSTRUCTION_LENGTH = 8;
  const MIN_RELEVANT_CHUNKS = 1;

  if (cleanInstruction.length < MIN_INSTRUCTION_LENGTH) {
    throw new Error("Summary instruction is too short. Please enter a more detailed study-related topic.");
  }

  const materials = await materialDal.getAllMaterials(projectId, userId);

  if (!materials || materials.length === 0) {
    throw new Error("No uploaded materials found");
  }

  const relevantChunks = await retrieveRelevantChunks(
    materials,
    cleanInstruction,
    8
  );

  if (relevantChunks.length < MIN_RELEVANT_CHUNKS) {
    throw new Error("Not enough relevant study material was found for this topic. Please upload additional materials related to this topic and try again.");
  }

  const summaryText = await generateSummaryFromContext(
    cleanInstruction,
    relevantChunks
  );

  if (!summaryText || !summaryText.trim() || summaryText.trim() === INSUFFICIENT_INFORMATION_MESSAGE) {
    throw new Error(
      "No relevant information was found in the uploaded study materials for this topic."
    );
  }

  const sources = buildUniqueSources(relevantChunks);

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