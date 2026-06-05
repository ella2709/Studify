import { useQuery, useMutation, useQueryClient  } from "@tanstack/react-query";
import { API } from "../api";

/**
 * @typedef {Object} ProjectDto
 * @property {string} id
 * @property {string} name
 * @property {*} createdAt
 * @property {*} updatedAt
 */

async function handleResponse(res) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

/**
 * @returns {Promise<ProjectDto[]>}
 */
export async function getProjects() {
  const res = await fetch(API.GET_PROJECTS);
  const data = await handleResponse(res);
  return data.projects;
}

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
};


export async function createProject(name) {
  const res = await fetch(API.CREATE_PROJECT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const data = await handleResponse(res);
  return data.project;
}

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};