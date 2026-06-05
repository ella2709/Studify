const BASE_URL = "http://localhost:3001";

export const API = {
  ASK_RAG: `${BASE_URL}/api/ai/ask-rag`,
  SUMMARIZE_RAG: `${BASE_URL}/api/ai/summarize-rag`,
  UPLOAD_MATERIALS: `${BASE_URL}/api/materials/upload`,
  GET_MATERIALS: `${BASE_URL}/api/materials`,
  ASK_CHATS: `${BASE_URL}/api/ai/ask-chats`,
  SUMMARIZE_CHATS: `${BASE_URL}/api/ai/summarize-chats`,
  HEALTH: `${BASE_URL}/api/health`,
  GET_PROJECTS: `${BASE_URL}/api/projects`,
  CREATE_PROJECT: `${BASE_URL}/api/projects`,
  projectConversations: (projectId) =>
    `${BASE_URL}/api/projects/${projectId}/conversations`,
};