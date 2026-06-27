import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/homePage";
import ProjectPage from "./pages/projectPage";
import QuestionsPage from "./pages/questionsPage";
import SummarizePage from "./pages/summarizePage";
import UploadMaterialPage from "./pages/uploadMaterialPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExamPage from "./pages/examPage";
import ProtectedRoute from "./authentication/protectedRoute";
import { useAuth } from "./authentication/authContext";

import MainLayout from "./components/mainLayout";
import { useProjects } from "./services/projectService";

function App() {
  const [isDark, setIsDark] = useState(false);
  const { user } = useAuth();

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError,
    error,
    refetch,
  } = useProjects(user);

  const projectsError = isError
    ? error?.message || "Failed to load projects"
    : "";

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
  }, [isDark]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout
              projects={projects}
              projectsLoading={projectsLoading}
              isDark={isDark}
              onToggleDark={() => setIsDark((d) => !d)}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      projects={projects}
                      projectsLoading={projectsLoading}
                      projectsError={projectsError}
                      onRefresh={refetch}
                    />
                  }
                />

                <Route path="/project/:projectId" element={<ProjectPage />} />

                <Route
                  path="/project/:projectId/upload"
                  element={<UploadMaterialPage />}
                />

                <Route
                  path="/project/:projectId/questions"
                  element={<QuestionsPage />}
                />

                <Route
                  path="/project/:projectId/summarize"
                  element={<SummarizePage />}
                />

                <Route path="/project/:projectId/exam" element={<ExamPage />} />

                <Route
                  path="/project/:projectId/exam/:examId"
                  element={<ExamPage />}
                />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;