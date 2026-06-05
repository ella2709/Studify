class MaterialDto {
  constructor(id, originalName, mimeType, size, uploadedAt, chunksCount) {
    this.id = id;
    this.originalName = originalName;
    this.mimeType = mimeType;
    this.size = size;
    this.uploadedAt = uploadedAt;
    this.chunksCount = chunksCount;
  }
}

function toMaterialDto(doc) {
  const data = doc.data();

  return new MaterialDto(
    doc.id,
    data.originalName || "",
    data.mimeType || "",
    data.size || 0,
    data.uploadedAt || null,
    data.chunks?.length || 0
  );
}

module.exports = {
  MaterialDto,
  toMaterialDto,
};