const uploadedMaterials = [];

function addMaterial(material) {
  uploadedMaterials.unshift(material);
}

function getAllMaterials() {
  return uploadedMaterials;
}

function getMaterialById(id) {
  return uploadedMaterials.find((item) => item.id === id);
}

function getAllMaterialsMetadata() {
  return uploadedMaterials.map((item) => ({
    id: item.id,
    originalName: item.originalName,
    mimeType: item.mimeType,
    size: item.size,
    uploadedAt: item.uploadedAt,
  }));
}

module.exports = {
  addMaterial,
  getAllMaterials,
  getMaterialById,
  getAllMaterialsMetadata,
};