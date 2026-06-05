class ProjectDto {
  constructor(id, name, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

function toProjectDto(doc) {
  const data = doc.data();

  return new ProjectDto(
    doc.id,
    data.name || "",
    data.createdAt || null,
    data.updatedAt || null
  );
}

module.exports = {
  ProjectDto,
  toProjectDto,
};