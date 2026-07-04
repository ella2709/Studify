import { API } from "../api";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getChatDate } from "../helpers/dateHelper";
import { getAuthHeaders } from "../authentication/authHeaders";

async function handleResponse(res) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function withProjectId(base, projectId) {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}projectId=${encodeURIComponent(projectId)}`;
}

export async function askQuestion(chatId, question, projectId) {
  const res = await fetch(API.ASK_RAG, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ chatId, question, projectId }),
  });

  return handleResponse(res);
}

export async function createQuestionChat(title, projectId) {
  const res = await fetch(API.ASK_CHATS, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ title, projectId }),
  });

  return handleResponse(res);
}

export async function getQuestionChats(projectId) {
  const res = await fetch(withProjectId(API.ASK_CHATS, projectId), {
    headers: await getAuthHeaders(),
  });

  return handleResponse(res);
}

export async function getQuestionChatMessages(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.ASK_CHATS}/${chatId}/messages`, projectId),
    {
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}

export async function deleteQuestionChat(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.ASK_CHATS}/${chatId}`, projectId),
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}

export const useQuestionChats = (projectId) =>
  useQuery({
    queryKey: ["questionChats", projectId],
    queryFn: () => getQuestionChats(projectId),
    enabled: !!projectId,
  });

export const useRecentChatsByProject = (projects = []) => {
  const questionQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["questionChats", project.id],
      queryFn: () => getQuestionChats(project.id),
      enabled: !!project.id,
    })),
  });

  const recentChatsByProject = {};

  projects.forEach((project, index) => {
    const questionChats =
      questionQueries[index]?.data?.chats?.map((chat) => ({
        ...chat,
        type: "question",
      })) || [];

    recentChatsByProject[project.id] = questionChats
      .sort((a, b) => getChatDate(b) - getChatDate(a))
      .slice(0, 3);
  });

  return recentChatsByProject;
};

