const crypto = require("crypto");
const materialsRepository = require("../services/materialService");
const { normalizeText, splitTextIntoChunks } = require("../utils/textUtils");
const { generateEmbedding } = require("../helpers/embeddingHelper");

function getProjectId(req) {
  const projectId = req.body?.projectId || req.query?.projectId || req.params?.projectId;

  if (!projectId) {
    throw new Error("Missing projectId");
  }

  return projectId;
}

async function uploadMaterials(req, res) {
  try {
    const files = req.files;
    const projectId = getProjectId(req);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    const savedFiles = [];

    for (const file of files) {
      const normalizedText = normalizeText(file.buffer.toString("utf-8"));
      const chunks = splitTextIntoChunks(normalizedText);

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
        text: normalizedText,
        chunks: chunkObjects,
      };

      const savedMaterial = await materialsRepository.addMaterial(material, projectId);
      savedFiles.push(savedMaterial);
    }

    res.status(201).json({
      message: "Files uploaded successfully",
      files: savedFiles,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      error: err?.message || "File upload failed",
    });
  }
}

async function getMaterials(req, res) {
  try {
    const projectId = getProjectId(req);
    const files = await materialsRepository.getAllMaterialsMetadata(projectId);

    res.json({ files });
  } catch (err) {
    console.error("GET MATERIALS ERROR:", err);
    res.status(500).json({
      error: err?.message || "Failed to get materials",
    });
  }
}

async function getMaterialById(req, res) {
  try {
    const projectId = getProjectId(req);

    const material = await materialsRepository.getMaterialById(
      req.params.id,
      projectId
    );

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.json({ material });
  } catch (err) {
    console.error("GET MATERIAL BY ID ERROR:", err);
    res.status(500).json({
      error: err?.message || "Failed to get material",
    });
  }
}

async function removeMaterial(req, res) {
  try {
    const projectId = getProjectId(req);
    const { id } = req.params;

    await materialsRepository.removeMaterial(id, projectId);

    res.json({ message: "File deleted successfully", id });
  } catch (err) {
    console.error("REMOVE MATERIAL ERROR:", err);
    res.status(500).json({
      error: err?.message || "Failed to delete material",
    });
  }
}

module.exports = {
  uploadMaterials,
  getMaterials,
  getMaterialById,
  removeMaterial,
};