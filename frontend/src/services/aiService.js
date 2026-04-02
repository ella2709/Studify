import { API } from "../api";

export async function askAi(question) {
  const res = await fetch(API.ASK_RAG, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data;
}

export async function summarizeAi() {
  const res = await fetch(API.SUMMARIZE_RAG, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Summarization failed");
  }

  return data;
}