function formatDate(value) {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return value;
}

function examDto(doc, latestAttempt = null) {
  const data = doc.data();

  return {
    id: doc.id,
    projectId: data.projectId,
    userId: data.userId,
    title: data.title,
    type: data.type,
    difficulty: data.difficulty || null,
    language: data.language || "en",
    numberOfQuestions: data.numberOfQuestions,
    questions: data.questions || [],
    status: latestAttempt?.status || data.status || "not_started",
    latestAttempt,
    createdAt: formatDate(data.createdAt),
    updatedAt: formatDate(data.updatedAt || data.createdAt),
  };
}

function examAttemptDto(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    examId: data.examId,
    userId: data.userId,
    status: data.status || "in_progress",
    answers: data.answers || {},
    startedAt: formatDate(data.startedAt),
    submittedAt: formatDate(data.submittedAt),
    duration: data.duration || null,
    grade: data.grade ?? null,
    feedback: data.feedback || null,
    createdAt: formatDate(data.createdAt),
    updatedAt: formatDate(data.updatedAt || data.createdAt),
  };
}

module.exports = {
  examDto,
  examAttemptDto,
};