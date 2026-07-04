import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "../api";
import { auth } from "../authentication/firebaseAuth";
import { getAuthHeaders } from "../authentication/authHeaders";

async function handleResponse(res) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getProjects() {
  const res = await fetch(API.GET_PROJECTS, {
    headers: await getAuthHeaders(),
  });

  const data = await handleResponse(res);
  return data.projects;
}

export const useProjects = (user) => {
  return useQuery({
    queryKey: ["projects", user?.uid],
    queryFn: getProjects,
    enabled: !!user,
  });
};

export async function createProject(name) {
  const res = await fetch(API.CREATE_PROJECT, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  const data = await handleResponse(res);
  return data.project;
}

export async function deleteProject(projectId) {
  const res = await fetch(API.DELETE_PROJECT(projectId), {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  await handleResponse(res);
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export function useRenameProject() {
  return useMutation({
    mutationFn: async ({ projectId, name }) => {
      const headers = await getAuthHeaders();

      const response = await fetch(API.RENAME_PROJECT(projectId), {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to rename project");
      }

      return data.project;
    },
  });
}
