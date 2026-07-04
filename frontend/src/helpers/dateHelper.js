export function safeFormatDate(value) {
  if (!value) return null;

  if (typeof value === "object" && !(value instanceof Date)) {
    const secs = value._seconds ?? value.seconds;
    if (typeof secs === "number") {
      return new Date(secs * 1000).toLocaleDateString();
    }

    return null;
  }


  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toLocaleDateString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString();
  }

  return null;
}

export function formatUploadDate(file) {
  const rawDate = file.createdAt || file.uploadedAt || file.created_at;
  if (!rawDate) return "";

  if (typeof rawDate === "object" && !(rawDate instanceof Date)) {
    const secs = rawDate._seconds ?? rawDate.seconds;
    if (typeof secs === "number") return new Date(secs * 1000).toLocaleDateString();
    return "";
  }

  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}



export function getChatDate(chat) {
  return new Date(
    chat.updatedAt ||
    chat.lastUsedAt ||
    chat.lastMessageAt ||
    chat.createdAt ||
    0
  ).getTime();
}
