import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "../api";
import { getAuthHeaders } from "../authentication/authHeaders";

async function handleResponse(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export async function generateExam(payload) {
  const res = await fetch(API.GENERATE_EXAM, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export const useGenerateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateExam,
    onSuccess: (exam) => {
      queryClient.invalidateQueries({ queryKey: ["exams", exam.projectId] });
    },
  });
};

export async function getProjectExams(projectId) {
  const res = await fetch(API.GET_PROJECT_EXAMS(projectId), {
    headers: await getAuthHeaders(),
  });

  const data = await handleResponse(res);
  return data.exams || [];
}

export const useProjectExams = (projectId) => {
  return useQuery({
    queryKey: ["exams", projectId],
    queryFn: () => getProjectExams(projectId),
    enabled: !!projectId,
  });
};

export async function getExamById(examId) {
  const res = await fetch(API.GET_EXAM_BY_ID(examId), {
    headers: await getAuthHeaders(),
  });

  return handleResponse(res);
}

export const useExam = (examId) => {
  return useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getExamById(examId),
    enabled: !!examId,
  });
};

export async function startExam({ examId }) {
  const res = await fetch(API.START_EXAM(examId), {
    method: "POST",
    headers: await getAuthHeaders(),
  });

  return handleResponse(res);
}

export const useStartExam = () => {
  return useMutation({
    mutationFn: startExam,
  });
};

export async function submitExam({ examId, attemptId, answers }) {
  const res = await fetch(API.SUBMIT_EXAM(examId), {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ attemptId, answers }),
  });

  return handleResponse(res);
}

export const useSubmitExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitExam,
    onSuccess: (attempt, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exam", variables.examId] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({
        queryKey: ["examAttempt", variables.examId, attempt.id],
      });
    },
  });
};

export async function saveAttemptAnswers({
  examId,
  attemptId,
  answers,
}) {
  const res = await fetch(
    API.SAVE_ATTEMPT_ANSWERS(
      examId,
      attemptId
    ),
    {
      method: "PATCH",
      headers:
        await getAuthHeaders(),
      body: JSON.stringify({
        answers,
      }),
    }
  );

  return handleResponse(res);
}

export const useSaveAttemptAnswers = () => {
  return useMutation({
    mutationFn: saveAttemptAnswers,
  });
};