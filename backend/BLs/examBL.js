const { admin } = require("../config/firebase");

const examDal = require("../Dals/examDal");
const materialDal = require("../Dals/materialDal");

const { retrieveRelevantChunks } = require("../helpers/ragHelper");
const {
  generateExamWithAI,
  gradeExamWithAI,
} = require("../helpers/examHelper");

function validateExamInput({ projectId, userId, type, numberOfQuestions }) {
  if (!projectId || !userId || !type || !numberOfQuestions) {
    throw new Error("Missing required exam fields");
  }

  if (!["multiple_choice", "open_questions"].includes(type)) {
    throw new Error("Invalid exam type");
  }

  if (Number(numberOfQuestions) < 1) {
    throw new Error("Number of questions must be greater than 0");
  }
}

async function generateExam({
  projectId,
  userId,
  type,
  numberOfQuestions,
  difficulty,
  language = "en",
}) {
  validateExamInput({ projectId, userId, type, numberOfQuestions });

  const materials = await materialDal.getAllMaterials(projectId, userId);

  if (!materials || materials.length === 0) {
    throw new Error("No uploaded materials found");
  }

  const relevantChunks = await retrieveRelevantChunks(
    materials,
    `Create a ${difficulty || "medium"} ${type} exam with ${numberOfQuestions} questions from the uploaded study materials.`,
    20
  );

  if (relevantChunks.length === 0) {
    throw new Error("No relevant material chunks found");
  }

  const aiExam = await generateExamWithAI({
    relevantChunks,
    type,
    numberOfQuestions: Number(numberOfQuestions),
    difficulty,
    language,
  });

  return examDal.createExam(
    {
      title: aiExam.title || "Generated Exam",
      type,
      difficulty: difficulty || null,
      language,
      numberOfQuestions: Number(numberOfQuestions),
      questions: aiExam.questions || [],
      status: "not_started",
    },
    projectId,
    userId
  );
}

async function getProjectExams(projectId, userId) {
  const exams = await examDal.getProjectExams(projectId, userId);

  const statusOrder = {
    in_progress: 0,
    not_started: 1,
    completed: 2,
  };

  return exams.sort((a, b) => {
    const statusDiff =
      (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return (
      new Date(b.updatedAt || b.createdAt || 0) -
      new Date(a.updatedAt || a.createdAt || 0)
    );
  });
}

async function getExamById(examId, userId) {
  return examDal.getExamById(examId, userId);
}

async function startExam(examId, userId) {
  const { examRef } = await examDal.getRawExamById(examId, userId);
  const latestAttempt = await examDal.getLatestAttemptByExamRef(examRef);

  if (latestAttempt?.status === "in_progress") {
    return latestAttempt;
  }

  await examDal.updateExamStatus(examRef, "in_progress");

  return examDal.createAttempt(examRef, {
    examId,
    userId,
    status: "in_progress",
    answers: {},
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    submittedAt: null,
    duration: null,
    grade: null,
    feedback: null,
  });
}

function validateAnswers(exam, answers) {
  const missing = [];

  exam.questions.forEach((question) => {
    const answer = answers?.[question.id];

    if (
      answer === undefined ||
      answer === null ||
      String(answer).trim() === ""
    ) {
      missing.push(question.id);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing answers for questions: ${missing.join(", ")}`);
  }
}

async function submitExam(examId, { attemptId, userId, answers }) {
  if (!attemptId || !answers) {
    throw new Error("Missing submit exam fields");
  }

  const { examRef, exam } = await examDal.getRawExamById(examId, userId);

  validateAnswers(exam, answers);

  const { attemptRef, attemptDoc } = await examDal.getAttemptRef(
    examRef,
    attemptId
  );

  const attemptData = attemptDoc.data();

  const startedAt = attemptData.startedAt?.toDate
    ? attemptData.startedAt.toDate()
    : new Date();

  const submittedAtDate = new Date();
  const duration = Math.floor((submittedAtDate - startedAt) / 1000);

  const aiFeedback = await gradeExamWithAI({
    exam,
    answers,
    duration,
  });

  const completedAttempt = await examDal.completeAttempt(attemptRef, {
    answers,
    duration,
    grade: aiFeedback.grade,
    feedback: aiFeedback,
  });

  await examDal.updateExamStatus(examRef, "completed");

  return completedAttempt;
}

async function getAttemptById(examId, attemptId, userId) {
  return examDal.getAttemptById(examId, attemptId, userId);
}

async function exportExamTxt(examId, userId) {
  const exam = await examDal.getExamById(examId, userId);

  let text = `${exam.title}\n\n`;

  exam.questions.forEach((q, index) => {
    text += `${index + 1}. ${q.question}\n`;

    if (q.type === "multiple_choice" && q.options) {
      q.options.forEach((option) => {
        text += `   ${option}\n`;
      });
    }

    text += "\n";
  });

  return text;
}

async function saveAttemptAnswers(examId, { attemptId, userId, answers }) {
  if (!attemptId) {
    throw new Error("Missing attemptId");
  }

  const { examRef } = await examDal.getRawExamById(examId, userId);

  const { attemptRef, attemptDoc } = await examDal.getAttemptRef(
    examRef,
    attemptId
  );

  const attemptData = attemptDoc.data();

  if (attemptData.status === "completed") {
    throw new Error("Cannot edit a completed attempt");
  }

  await examDal.updateExamStatus(examRef, "in_progress");

  return examDal.saveAttemptAnswers(attemptRef, answers || {});
}

module.exports = {
  generateExam,
  getProjectExams,
  getExamById,
  startExam,
  submitExam,
  getAttemptById,
  exportExamTxt,
  saveAttemptAnswers,
};