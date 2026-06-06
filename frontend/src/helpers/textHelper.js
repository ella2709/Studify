export function isHebrewText(text) {
  return /[\u0590-\u05FF]/.test(text);
}

export function getTextDirection(text) {
  return isHebrewText(text) ? "rtl" : "ltr";
}

export function getTextAlign(text) {
  return isHebrewText(text) ? "right" : "left";
}