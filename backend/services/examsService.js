const { db, admin } = require("../config/firebase");
const materialsRepository = require("./materialService");
const { retrieveRelevantChunks } = require("../helpers/ragHelper");
const { examDto, examAttemptDto } = require("../Dtos/examDto");
const {
  generateExamWithAI,
  gradeExamWithAI,
} = require("../helpers/examHelper");

function getExamsCollection(userId, projectId) {
  if (!userId) throw new Error("Missing userId");
  if (!projectId) throw new Error("Missing projectId");

  return db
    .collection("users")
    .doc(userId)
    .collection("projects")
    .doc(projectId)
    .collection("exams");
}

async function getLatestAttempt(examRef) {
  const snapshot = await examRef
    .collection("attempts")
    .orderBy("updatedAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return examAttemptDto(snapshot.docs[0]);
}

async function findExamRefById(examId, userId) {
  const projectsSnapshot = await db
    .collection("users")
    .doc(userId)
    .collection("projects")
    .get();

  for (const projectDoc of projectsSnapshot.docs) {
    const examRef = projectDoc.ref.collection("exams").doc(examId);
    const examDoc = await examRef.get();

    if (examDoc.exists) {
      return { examRef, examDoc, projectId: projectDoc.id };
    }
  }

  throw new Error("Exam not found");
}

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

  const materials = await materialsRepository.getAllMaterials(projectId, userId);

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

  const examData = {
    projectId,
    userId,
    title: aiExam.title || "Generated Exam",
    type,
    difficulty: difficulty || null,
    language,
    numberOfQuestions: Number(numberOfQuestions),
    questions: aiExam.questions || [],
    status: "not_started",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const examRef = await getExamsCollection(userId, projectId).add(examData);
  const examDoc = await examRef.get();

  return examDto(examDoc);
}

async function getProjectExams(projectId, userId) {
  const snapshot = await getExamsCollection(userId, projectId)
    .orderBy("updatedAt", "desc")
    .get();

  const exams = [];

  for (const doc of snapshot.docs) {
    const latestAttempt = await getLatestAttempt(doc.ref);
    exams.push(examDto(doc, latestAttempt));
  }

  const statusOrder = {
    in_progress: 0,
    not_started: 1,
    completed: 2,
  };

  return exams.sort((a, b) => {
    const statusDiff =
      (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);

    if (statusDiff !== 0) return statusDiff;

    return (
      new Date(b.updatedAt || b.createdAt || 0) -
      new Date(a.updatedAt || a.createdAt || 0)
    );
  });
}

async function getExamById(examId, userId) {
  const { examRef, examDoc } = await findExamRefById(examId, userId);
  const latestAttempt = await getLatestAttempt(examRef);

  return examDto(examDoc, latestAttempt);
}

async function startExam(examId, userId) {
  const { examRef } = await findExamRefById(examId, userId);

  const latestAttempt = await getLatestAttempt(examRef);

  if (latestAttempt?.status === "in_progress") {
    return latestAttempt;
  }

  const attemptData = {
    examId,
    userId,
    status: "in_progress",
    answers: {},
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    submittedAt: null,
    duration: null,
    grade: null,
    feedback: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await examRef.update({
    status: "in_progress",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const attemptRef = await examRef.collection("attempts").add(attemptData);
  const attemptDoc = await attemptRef.get();

  return examAttemptDto(attemptDoc);
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

  const { examRef, examDoc } = await findExamRefById(examId, userId);
  const exam = examDto(examDoc);

  validateAnswers(exam, answers);

  const attemptRef = examRef.collection("attempts").doc(attemptId);
  const attemptDoc = await attemptRef.get();

  if (!attemptDoc.exists) {
    throw new Error("Attempt not found");
  }

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

  await attemptRef.update({
    status: "completed",
    answers,
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    duration,
    grade: aiFeedback.grade,
    feedback: aiFeedback,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await examRef.update({
    status: "completed",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await attemptRef.get();

  return examAttemptDto(updatedDoc);
}

async function getAttemptById(examId, attemptId, userId) {
  const { examRef } = await findExamRefById(examId, userId);

  const doc = await examRef.collection("attempts").doc(attemptId).get();

  if (!doc.exists) {
    throw new Error("Attempt not found");
  }

  return examAttemptDto(doc);
}

async function exportExamTxt(examId, userId) {
  const exam = await getExamById(examId, userId);

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

async function saveAttemptAnswers(
  examId,
  {
    attemptId,
    userId,
    answers,
  }
) {
  if (!attemptId) {
    throw new Error("Missing attemptId");
  }

  const { examRef } = await findExamRefById(
    examId,
    userId
  );

  const attemptRef =
    examRef
      .collection("attempts")
      .doc(attemptId);

  const attemptDoc =
    await attemptRef.get();

  if (!attemptDoc.exists) {
    throw new Error("Attempt not found");
  }

  const attemptData =
    attemptDoc.data();

  if (
    attemptData.status ===
    "completed"
  ) {
    throw new Error(
      "Cannot edit a completed attempt"
    );
  }

  await attemptRef.update({
    answers: answers || {},
    updatedAt:
      admin.firestore.FieldValue.serverTimestamp(),
  });

  await examRef.update({
    status: "in_progress",
    updatedAt:
      admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc =
    await attemptRef.get();

  return examAttemptDto(updatedDoc);
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