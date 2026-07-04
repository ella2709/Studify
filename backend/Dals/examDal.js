const { db, admin } = require("../config/firebase");
const { examDto, examAttemptDto } = require("../Dtos/examDto");

function getExamsCollection(userId, projectId) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  if (!projectId) {
    throw new Error("Missing projectId");
  }

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

  if (snapshot.empty) {
    return null;
  }

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
      return {
        examRef,
        examDoc,
        projectId: projectDoc.id,
      };
    }
  }

  throw new Error("Exam not found");
}

async function createExam(examData, projectId, userId) {
  const examRef = await getExamsCollection(userId, projectId).add({
    ...examData,
    projectId,
    userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

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

  return exams;
}

async function getExamById(examId, userId) {
  const { examRef, examDoc } = await findExamRefById(examId, userId);
  const latestAttempt = await getLatestAttempt(examRef);

  return examDto(examDoc, latestAttempt);
}

async function getRawExamById(examId, userId) {
  const { examRef, examDoc } = await findExamRefById(examId, userId);

  return {
    examRef,
    exam: examDto(examDoc),
  };
}

async function updateExamStatus(examRef, status) {
  await examRef.update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function createAttempt(examRef, attemptData) {
  const attemptRef = await examRef.collection("attempts").add({
    ...attemptData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const attemptDoc = await attemptRef.get();

  return examAttemptDto(attemptDoc);
}

async function getAttemptById(examId, attemptId, userId) {
  const { examRef } = await findExamRefById(examId, userId);
  const attemptDoc = await examRef.collection("attempts").doc(attemptId).get();

  if (!attemptDoc.exists) {
    throw new Error("Attempt not found");
  }

  return examAttemptDto(attemptDoc);
}

async function getLatestAttemptByExamRef(examRef) {
  return getLatestAttempt(examRef);
}

async function getAttemptRef(examRef, attemptId) {
  const attemptRef = examRef.collection("attempts").doc(attemptId);
  const attemptDoc = await attemptRef.get();

  if (!attemptDoc.exists) {
    throw new Error("Attempt not found");
  }

  return {
    attemptRef,
    attemptDoc,
  };
}

async function completeAttempt(attemptRef, { answers, duration, grade, feedback }) {
  await attemptRef.update({
    status: "completed",
    answers,
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    duration,
    grade,
    feedback,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await attemptRef.get();

  return examAttemptDto(updatedDoc);
}

async function saveAttemptAnswers(attemptRef, answers) {
  await attemptRef.update({
    answers: answers || {},
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await attemptRef.get();

  return examAttemptDto(updatedDoc);
}

module.exports = {
  createExam,
  getProjectExams,
  getExamById,
  getRawExamById,
  updateExamStatus,
  createAttempt,
  getAttemptById,
  getLatestAttemptByExamRef,
  getAttemptRef,
  completeAttempt,
  saveAttemptAnswers,
};