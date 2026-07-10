import { API } from "../api";
import { getAuthHeaders } from "../authentication/authHeaders";

async function handleResponse(res) {
  const text = await res.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const error = new Error(
      data.error || data.message || "Request failed"
    );

    error.code = data.code || null;
    error.status = res.status;

    if (error.code === "AI_LIMIT_REACHED") {
      window.dispatchEvent(
        new CustomEvent("ai-limit-reached", {
          detail: {
            message:
              data.error ||
              data.message ||
              "AI features are temporarily unavailable.",
          },
        })
      );
    }

    throw error;
  }

  return data;
}

export async function getMaterials(projectId) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  const res = await fetch(
    `${API.GET_MATERIALS}?projectId=${encodeURIComponent(
      projectId
    )}`,
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await handleResponse(res);

  return data.files || [];
}

export async function uploadMaterials(
  projectId,
  files
) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  formData.append("projectId", projectId);

  const res = await fetch(
    API.UPLOAD_MATERIALS,
    {
      method: "POST",
      headers: await getAuthHeaders(true),
      body: formData,
    }
  );

  const data = await handleResponse(res);

  return data.files || [];
}

export async function deleteMaterial(
  projectId,
  materialId
) {
  if (!projectId) {
    throw new Error("Missing projectId");
  }

  if (!materialId) {
    throw new Error("Missing materialId");
  }

  const res = await fetch(
    `${API.GET_MATERIALS}/${materialId}?projectId=${encodeURIComponent(
      projectId
    )}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}