import { API } from "../api";

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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, projectId }),
  });

  return handleResponse(res);
}

export async function getAskChats(projectId) {
  const res = await fetch(withProjectId(API.ASK_CHATS, projectId));
  return handleResponse(res);
}

export async function getAskChatMessages(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.ASK_CHATS}/${chatId}/messages`, projectId)
  );

  return handleResponse(res);
}

export async function askAi(chatId, question, projectId) {
  const res = await fetch(API.ASK_RAG, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, question, projectId }),
  });

  return handleResponse(res);
}

export async function deleteAskChat(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.ASK_CHATS}/${chatId}`, projectId),
    { method: "DELETE" }
  );

  return handleResponse(res);
}

// ---------- SUMMARIZE AI ----------

export async function createSummarizeChat(title, projectId) {
  const res = await fetch(API.SUMMARIZE_CHATS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, projectId }),
  });

  return handleResponse(res);
}

export async function getSummarizeChats(projectId) {
  const res = await fetch(withProjectId(API.SUMMARIZE_CHATS, projectId));
  return handleResponse(res);
}

export async function getSummarizeChatMessages(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.SUMMARIZE_CHATS}/${chatId}/messages`, projectId)
  );

  return handleResponse(res);
}

export async function summarizeAi(chatId, topic, projectId) {
  const res = await fetch(API.SUMMARIZE_RAG, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, topic, projectId }),
  });

  return handleResponse(res);
}


export async function deleteSummarizeChat(chatId, projectId) {
  const res = await fetch(
    withProjectId(`${API.SUMMARIZE_CHATS}/${chatId}`, projectId),
    { method: "DELETE" }
  );

  return handleResponse(res);
}

