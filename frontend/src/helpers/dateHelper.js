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