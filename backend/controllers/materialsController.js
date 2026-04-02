const crypto = require("crypto");
const materialsService = require("../services/materialsService");
const { normalizeText } = require("../utils/textUtils");

function uploadMaterials(req, res) {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    const savedFiles = files.map((file) => {
      const material = {
        id: crypto.randomUUID(),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        text: normalizeText(file.buffer.toString("utf-8")),
      };

      materialsService.addMaterial(material);

      return {
        id: material.id,
        originalName: material.originalName,
        mimeType: material.mimeType,
        size: material.size,
        uploadedAt: material.uploadedAt,
      };
    });

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