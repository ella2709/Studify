import { API } from "../api";
import { getAuthHeaders } from "../authentication/authHeaders";

async function handleResponse(res) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getMaterials(projectId) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  const res = await fetch(
    `${API.GET_MATERIALS}?projectId=${encodeURIComponent(projectId)}`,
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await handleResponse(res);
  return data.files || [];
}

export async function uploadMaterials(projectId, files) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  formData.append("projectId", projectId);

  const res = await fetch(API.UPLOAD_MATERIALS, {
    method: "POST",
    headers: await getAuthHeaders(true),
    body: formData,
  });

  const data = await handleResponse(res);
  return data.files || [];
}

export async function deleteMaterial(projectId, materialId) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  if (!materialId) {
    throw new Error("Missing materialId");
  }

  const res = await fetch(
    `${API.GET_MATERIALS}/${materialId}?projectId=${encodeURIComponent(projectId)}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}