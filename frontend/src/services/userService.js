import { API, authHeaders } from "../api";

export async function createUser(name) {
  const headers = await authHeaders();

  const response = await fetch(API.CREATE_USER, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create user");
  }

  return data.user;
}

export async function getMe() {
  const headers = await authHeaders();

  const response = await fetch(API.GET_ME, {
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to get current user");
  }

  return data.user;
}