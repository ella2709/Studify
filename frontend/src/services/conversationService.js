import { API } from "../api";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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

// ---------- ASK AI ----------

export async function createAskChat(title, projectId) {
  const res = await fetch(API.ASK_CHATS, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ title, projectId }),
  });

  return handleResponse(res);
}

export async function getAskChats(projectId) {
  const res = await fetch(withProjectId(API.ASK_CHATS, projectId), {
    headers: await getAuthHeaders(),
  });

  return handleResponse(res);
}

export async function getAskChatMessages(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.ASK_CHATS}/${chatId}/messages`, projectId),
    {
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}

export async function askAi(chatId, question, projectId) {
  const res = await fetch(API.ASK_RAG, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ chatId, question, projectId }),
  });

  return handleResponse(res);
}

export async function deleteAskChat(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.ASK_CHATS}/${chatId}`, projectId),
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}

// ---------- SUMMARIZE AI ----------

export async function createSummarizeChat(title, projectId) {
  const res = await fetch(API.SUMMARIZE_CHATS, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ title, projectId }),
  });

  return handleResponse(res);
}

export async function getSummarizeChats(projectId) {
  const res = await fetch(withProjectId(API.SUMMARIZE_CHATS, projectId), {
    headers: await getAuthHeaders(),
  });

  return handleResponse(res);
}

export async function getSummarizeChatMessages(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.SUMMARIZE_CHATS}/${chatId}/messages`, projectId),
    {
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}

export async function summarizeAi(chatId, topic, projectId) {
  const res = await fetch(API.SUMMARIZE_RAG, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ chatId, topic, projectId }),
  });

  return handleResponse(res);
}

export async function deleteSummarizeChat(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.SUMMARIZE_CHATS}/${chatId}`, projectId),
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}

export const useAskChats = (projectId) =>
  useQuery({
    queryKey: ["askChats", projectId],
    queryFn: () => getAskChats(projectId),
    enabled: !!projectId,
  });

export const useSummarizeChats = (projectId) =>
  useQuery({
    queryKey: ["summarizeChats", projectId],
    queryFn: () => getSummarizeChats(projectId),
    enabled: !!projectId,
  });

export const useRecentChatsByProject = (projects = []) => {
  const askQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["askChats", project.id],
      queryFn: () => getAskChats(project.id),
      enabled: !!project.id,
    })),
  });

  const summarizeQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["summarizeChats", project.id],
      queryFn: () => getSummarizeChats(project.id),
      enabled: !!project.id,
    })),
  });

  const recentChatsByProject = {};

  projects.forEach((project, index) => {
    const askChats =
      askQueries[index]?.data?.chats?.map((chat) => ({
        ...chat,
        type: "ask",
      })) || [];

    const summarizeChats =
      summarizeQueries[index]?.data?.chats?.map((chat) => ({
        ...chat,
        type: "summarize",
      })) || [];

    recentChatsByProject[project.id] = [...askChats, ...summarizeChats]
      .sort((a, b) => getChatDate(b) - getChatDate(a))
      .slice(0, 3);
  });

  return recentChatsByProject;
};