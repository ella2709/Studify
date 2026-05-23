import { API } from "../api";

async function handleResponse(res) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// ---------- ASK AI ----------

export async function createAskChat(title) {
  const res = await fetch(API.ASK_CHATS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  return handleResponse(res);
}

export async function getAskChats() {
  const res = await fetch(API.ASK_CHATS);

  return handleResponse(res);
}

export async function getAskChatMessages(chatId) {
  const res = await fetch(`${API.ASK_CHATS}/${chatId}/messages`);

  return handleResponse(res);
}

export async function askAi(chatId, question) {
  const res = await fetch(API.ASK_RAG, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatId,
      question,
    }),
  });

  return handleResponse(res);
}

// ---------- SUMMARIZE AI ----------

export async function createSummarizeChat(title) {
  const res = await fetch(API.SUMMARIZE_CHATS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  return handleResponse(res);
}

export async function getSummarizeChats() {
  const res = await fetch(API.SUMMARIZE_CHATS);

  return handleResponse(res);
}

export async function getSummarizeChatMessages(chatId) {
  const res = await fetch(`${API.SUMMARIZE_CHATS}/${chatId}/messages`);

  return handleResponse(res);
}

export async function summarizeAi(chatId, topic) {
  const res = await fetch(API.SUMMARIZE_RAG, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatId,
      topic,
    }),
  });

  return handleResponse(res);
}