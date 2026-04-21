const crypto = require("crypto");
const materialsService = require("../services/materialsService");
const { normalizeText, splitTextIntoChunks } = require("../utils/textUtils");
const { generateEmbedding } = require("../services/embeddingService");

async function uploadMaterials(req, res) {
  try {
    const files = req.files;

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
        uploadedAt: new Date().toISOString(),
        text: normalizedText,
        chunks: chunkObjects,
      };

      materialsService.addMaterial(material);

      savedFiles.push({
        id: material.id,
        originalName: material.originalName,
        mimeType: material.mimeType,
        size: material.size,
        uploadedAt: material.uploadedAt,
        chunksCount: material.chunks.length,
      });
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

module.exports = {
  uploadMaterials,
};

function getMaterials(req, res) {
  const files = materialsService.getAllMaterialsMetadata();
  res.json({ files });
}

function getMaterialById(req, res) {
  const material = materialsService.getMaterialById(req.params.id);

  if (!material) {
    return res.status(404).json({ error: "Material not found" });
  }

  res.json(material);
}

module.exports = {
  uploadMaterials,
  getMaterials,
  getMaterialById,
};