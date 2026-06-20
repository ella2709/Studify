const BASE_URL = "http://localhost:3001";
import { auth } from "./authentication/firebaseAuth";

export async function authHeaders() {

  const token =
    await auth.currentUser?.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export const API = {
  HEALTH: `${BASE_URL}/api/health`,

  ASK_RAG: `${BASE_URL}/api/questions/ask-rag`,
  SUMMARIZE_RAG: `${BASE_URL}/api/summaries/summarize-rag`,

  ASK_CHATS: `${BASE_URL}/api/questions/ask-chats`,
  SUMMARIZE_CHATS: `${BASE_URL}/api/summaries/summarize-chats`,

  UPLOAD_MATERIALS: `${BASE_URL}/api/materials/upload`,
  GET_MATERIALS: `${BASE_URL}/api/materials`,

  GET_PROJECTS: `${BASE_URL}/api/projects`,
  CREATE_PROJECT: `${BASE_URL}/api/projects`,

  GENERATE_EXAM: `${BASE_URL}/api/exams/generate`,
  GET_PROJECT_EXAMS: (projectId) => `${BASE_URL}/api/exams/project/${projectId}`,
  GET_EXAM_BY_ID: (examId) => `${BASE_URL}/api/exams/${examId}`,
  START_EXAM: (examId) => `${BASE_URL}/api/exams/${examId}/start`,
  SUBMIT_EXAM: (examId) => `${BASE_URL}/api/exams/${examId}/submit`,
  SAVE_ATTEMPT_ANSWERS: (examId,attemptId) => `${BASE_URL}/api/exams/${examId}/attempts/${attemptId}/answers`,
};