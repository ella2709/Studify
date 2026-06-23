export function getFileBadge(fileName = "") {
  const n = fileName.toLowerCase();

  if (n.endsWith(".pdf")) return "PDF";
  if (n.endsWith(".docx") || n.endsWith(".doc")) return "DOC";
  if (n.endsWith(".pptx") || n.endsWith(".ppt")) return "PPT";
  if (n.endsWith(".xlsx") || n.endsWith(".xls")) return "XLS";
  if (n.endsWith(".txt")) return "TXT";
  if (n.endsWith(".md")) return "MD";
  if (n.endsWith(".csv")) return "CSV";

  return "FILE";
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}