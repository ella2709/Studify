function isGeminiQuotaError(error) {
  const message = String(
    error?.message ||
    error?.error?.message ||
    ""
  ).toLowerCase();

  const status =
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.error?.code;

  return (
    Number(status) === 429 ||
    message.includes("resource_exhausted") ||
    message.includes("resource exhausted") ||
    message.includes("quota exceeded") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
}

function createAiLimitError() {
  const error = new Error(
    "AI features are temporarily unavailable."
  );

  error.code = "AI_LIMIT_REACHED";
  error.status = 503;

  return error;
}

function normalizeGeminiError(error) {
  if (isGeminiQuotaError(error)) {
    return createAiLimitError();
  }

  return error;
}

function sendControllerError(
  res,
  error,
  fallbackMessage = "Request failed"
) {
  if (error?.code === "AI_LIMIT_REACHED") {
    return res.status(503).json({
      code: "AI_LIMIT_REACHED",
      error: "AI features are temporarily unavailable.",
      accessMode: "view_only",
    });
  }

  return res.status(error?.status || 500).json({
    error: error?.message || fallbackMessage,
  });
}

module.exports = {
  isGeminiQuotaError,
  createAiLimitError,
  normalizeGeminiError,
  sendControllerError,
};