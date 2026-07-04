const { formatFirestoreDate } = require("../utils/dateUtils");

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
    createdAt: formatFirestoreDate(data.createdAt),
    updatedAt: formatFirestoreDate(data.updatedAt || data.createdAt),
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
    startedAt: formatFirestoreDate(data.startedAt),
    submittedAt: formatFirestoreDate(data.submittedAt),
    duration: data.duration || null,
    grade: data.grade ?? null,
    feedback: data.feedback || null,
    createdAt: formatFirestoreDate(data.createdAt),
    updatedAt: formatFirestoreDate(data.updatedAt || data.createdAt),
  };
}

module.exports = {
  examDto,
  examAttemptDto,
};