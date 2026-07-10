import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
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

export async function generateSummary(payload) {
  const res = await fetch(API.GENERATE_SUMMARY, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);

  return data.summary;
}

export const useGenerateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateSummary,

    onSuccess: (summary) => {
      queryClient.invalidateQueries({
        queryKey: [
          "summaries",
          summary.projectId,
        ],
      });
    },
  });
};

export async function getProjectSummaries(
  projectId
) {
  const res = await fetch(
    API.GET_PROJECT_SUMMARIES(projectId),
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await handleResponse(res);

  return data.summaries || [];
}

export const useProjectSummaries = (
  projectId
) => {
  return useQuery({
    queryKey: ["summaries", projectId],
    queryFn: () =>
      getProjectSummaries(projectId),
    enabled: !!projectId,
  });
};

export async function getSummaryById(
  summaryId,
  projectId
) {
  const res = await fetch(
    API.GET_SUMMARY_BY_ID(
      summaryId,
      projectId
    ),
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await handleResponse(res);

  return data.summary;
}

export const useSummary = (
  summaryId,
  projectId
) => {
  return useQuery({
    queryKey: [
      "summary",
      summaryId,
      projectId,
    ],
    queryFn: () =>
      getSummaryById(
        summaryId,
        projectId
      ),
    enabled:
      !!summaryId && !!projectId,
  });
};

export async function deleteSummary(
  summaryId,
  projectId
) {
  const res = await fetch(
    API.DELETE_SUMMARY(
      summaryId,
      projectId
    ),
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  return handleResponse(res);
}

export const useDeleteSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      summaryId,
      projectId,
    }) =>
      deleteSummary(
        summaryId,
        projectId
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "summaries",
          variables.projectId,
        ],
      });
    },
  });
};

