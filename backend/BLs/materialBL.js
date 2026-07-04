const crypto = require("crypto");
const materialDal = require("../Dals/materialDal");

const { normalizeText, splitTextIntoChunks } = require("../utils/textUtils");
const { generateEmbedding } = require("../helpers/embeddingHelper");
const { extractTextFromFile } = require("../helpers/extractTextFromFile");

async function uploadMaterials({ files, projectId, userId }) {
  if (!files || files.length === 0) {
    throw new Error("No files were uploaded");
  }

  const savedFiles = [];

  for (const file of files) {
    const extractedText = await extractTextFromFile(file);
    const normalizedText = normalizeText(extractedText);
    const chunks = splitTextIntoChunks(normalizedText);

    if (chunks.length === 0) {
      throw new Error(`No readable text was found in file: ${file.originalname}`);
    }

    const chunkObjects = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = await generateEmbedding(chunkText);

      chunkObjects.push({
        id: crypto.randomUUID(),
        chunkIndex: i,
        text: chunkText,
        embedding,
      });
    }

    const material = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      chunksCount: chunkObjects.length,
    };

    const savedMaterial = await materialDal.addMaterialWithChunks(
      material,
      chunkObjects,
      projectId,
      userId
    );

    savedFiles.push(savedMaterial);
  }

  return savedFiles;
}

async function getMaterials({ projectId, userId }) {
  return materialDal.getAllMaterialsMetadata(projectId, userId);
}

async function getMaterialById({ id, projectId, userId }) {
  if (!id) {
    throw new Error("Missing material id");
  }

  const material = await materialDal.getMaterialById(id, projectId, userId);

  if (!material) {
    throw new Error("Material not found");
  }

  return material;
}

async function removeMaterial({ id, projectId, userId }) {
  if (!id) {
    throw new Error("Missing material id");
  }

  await materialDal.removeMaterial(id, projectId, userId);

  return { id };
}

module.exports = {
  uploadMaterials,
  getMaterials,
  getMaterialById,
  removeMaterial,
};