import { API, authHeaders } from "../api";

async function request(url, options = {}) {
  const headers = await authHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Admin request failed");
  }

  return data;
}

export async function getAdminUsers() {
  const data = await request(API.ADMIN_USERS);
  return data.users;
}

export async function updateUserRole(uid, role) {
  const data = await request(API.ADMIN_UPDATE_ROLE(uid), {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

  return data.user;
}

export async function blockUser(uid) {
  const data = await request(API.ADMIN_BLOCK_USER(uid), {
    method: "PATCH",
  });

  return data.user;
}

export async function unblockUser(uid) {
  const data = await request(API.ADMIN_UNBLOCK_USER(uid), {
    method: "PATCH",
  });

  return data.user;
}


export async function hardDeleteUser(uid) {
  return request(API.ADMIN_HARD_DELETE_USER(uid), {
    method: "DELETE",
  });
}

export async function resetUserData(uid) {
  return request(API.ADMIN_RESET_USER_DATA(uid), {
    method: "DELETE",
  });
}