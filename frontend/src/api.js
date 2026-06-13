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

  ASK_RAG: `${BASE_URL}/api/ai/ask-rag`,
  SUMMARIZE_RAG: `${BASE_URL}/api/ai/summarize-rag`,

  ASK_CHATS: `${BASE_URL}/api/ai/ask-chats`,
  SUMMARIZE_CHATS: `${BASE_URL}/api/ai/summarize-chats`,

  UPLOAD_MATERIALS: `${BASE_URL}/api/materials/upload`,
  GET_MATERIALS: `${BASE_URL}/api/materials`,

  GET_PROJECTS: `${BASE_URL}/api/projects`,
  CREATE_PROJECT: `${BASE_URL}/api/projects`,
};