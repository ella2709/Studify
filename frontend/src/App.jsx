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
import { CreateProjectModal } from "./components/homePageComponents";
import {useProjects, useCreateProject, useDeleteProject, } from "./services/projectService";

function App() {
  const [isDark, setIsDark] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const { user, loading } = useAuth();

  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

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

  const openCreate = () => {
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    setNewProjectName("");
    setCreateError("");
  };

  async function handleCreateProject() {
    const name = newProjectName.trim();

    if (!name) return;

    setCreateError("");
    setCreating(true);

    try {
      await createProjectMutation.mutateAsync(name);
      closeCreate();
    } catch (err) {
      setCreateError(err?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProject(projectId) {
  try {
    await deleteProjectMutation.mutateAsync(projectId);
  } catch (err) {
    console.error("Failed to delete project:", err);
  }
}

  return (
  <>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <>
              <MainLayout
                projects={projects}
                projectsLoading={projectsLoading}
                isDark={isDark}
                onToggleDark={() => setIsDark((d) => !d)}
                onCreateProject={openCreate}
              >
                <Routes>
                  <Route
                    path="/"
                    element={
                     <HomePage
                      projects={projects}
                      projectsLoading={projectsLoading}
                      projectsError={projectsError}
                      onCreateProject={openCreate}
                      onRefresh={refetch}
                      onDeleteProject={handleDeleteProject}
                    />
                    }
                  />

                  <Route
                    path="/project/:projectId"
                    element={<ProjectPage />}
                  />

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

                  <Route 
                    path="/project/:projectId/exam" 
                    element={<ExamPage />} 
                  />

                  <Route 
                    path="/project/:projectId/exam/:examId" 
                    element={<ExamPage />} 
                  />

                </Routes>
              </MainLayout>

              {isCreateOpen && (
                <CreateProjectModal
                  name={newProjectName}
                  onNameChange={setNewProjectName}
                  onSubmit={handleCreateProject}
                  onClose={closeCreate}
                  creating={creating}
                  error={createError}
                />
              )}
            </>
          </ProtectedRoute>
        }
      />
    </Routes>
  </>
);
}

export default App;