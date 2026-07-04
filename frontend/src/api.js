const BASE_URL = "http://localhost:3001";
import { auth } from "./authentication/firebaseAuth";

export async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export const API = {
  HEALTH: `${BASE_URL}/api/health`,


  // ---------- Users ----------
  CREATE_USER: `${BASE_URL}/api/users/profile`,
  GET_ME: `${BASE_URL}/api/users/me`,

  // ---------- Admin ----------
  ADMIN_USERS: `${BASE_URL}/api/admin/users`,
  ADMIN_USER_BY_ID: (uid) => `${BASE_URL}/api/admin/users/${uid}`,
  ADMIN_UPDATE_ROLE: (uid) => `${BASE_URL}/api/admin/users/${uid}/role`,
  ADMIN_BLOCK_USER: (uid) => `${BASE_URL}/api/admin/users/${uid}/block`,
  ADMIN_UNBLOCK_USER: (uid) => `${BASE_URL}/api/admin/users/${uid}/unblock`,
  ADMIN_SOFT_DELETE_USER: (uid) => `${BASE_URL}/api/admin/users/${uid}`,
  ADMIN_HARD_DELETE_USER: (uid) => `${BASE_URL}/api/admin/users/${uid}/permanent`,
  ADMIN_RESET_USER_DATA: (uid) => `${BASE_URL}/api/admin/users/${uid}/system-data`,

  // ---------- Materials ----------
  UPLOAD_MATERIALS: `${BASE_URL}/api/materials/upload`,
  GET_MATERIALS: `${BASE_URL}/api/materials`,

  // ---------- Projects ----------
  GET_PROJECTS: `${BASE_URL}/api/projects`,
  CREATE_PROJECT: `${BASE_URL}/api/projects`,
  RENAME_PROJECT: (projectId) =>`${BASE_URL}/api/projects/${projectId}`,
  DELETE_PROJECT: (projectId) =>`${BASE_URL}/api/projects/${projectId}`,

  // ---------- Questions ----------
  ASK_RAG: `${BASE_URL}/api/questions/ask-rag`,
  ASK_CHATS: `${BASE_URL}/api/questions/ask-chats`,

  // ---------- Summaries ----------
  SUMMARIES: `${BASE_URL}/api/summaries`,
  GENERATE_SUMMARY: `${BASE_URL}/api/summaries/generate`,
  GET_PROJECT_SUMMARIES: (projectId) =>
    `${BASE_URL}/api/summaries/project/${projectId}`,
  GET_SUMMARY_BY_ID: (summaryId, projectId) =>
    `${BASE_URL}/api/summaries/${summaryId}?projectId=${encodeURIComponent(
      projectId
    )}`,
  DELETE_SUMMARY: (summaryId, projectId) =>
    `${BASE_URL}/api/summaries/${summaryId}?projectId=${encodeURIComponent(
      projectId
    )}`,

  // ---------- Exams ----------
  GENERATE_EXAM: `${BASE_URL}/api/exams/generate`,
  GET_PROJECT_EXAMS: (projectId) =>
    `${BASE_URL}/api/exams/project/${projectId}`,
  GET_EXAM_BY_ID: (examId) =>
    `${BASE_URL}/api/exams/${examId}`,
  START_EXAM: (examId) =>
    `${BASE_URL}/api/exams/${examId}/start`,
  SUBMIT_EXAM: (examId) =>
    `${BASE_URL}/api/exams/${examId}/submit`,
  SAVE_ATTEMPT_ANSWERS: (examId, attemptId) =>
    `${BASE_URL}/api/exams/${examId}/attempts/${attemptId}/answers`,
};