import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusIcon, SearchIcon } from "../components/iconsAndButtons";
import { ProjectCard } from "../components/projectCard";
import { ProjectActionsDialog } from "../components/projectActionsDialog";
import ConfirmDialog from "../components/confirmDialog";
import messages from "../messages";
import { auth } from "../authentication/firebaseAuth";
import { useCreateProject, useDeleteProject, useRenameProject } from "../services/projectService";

function HomePage({
  projects = [],
  projectsLoading,
  projectsError,
  onRefresh,
}) {

  const location = useLocation();
  const navigate = useNavigate();

  const userName = auth.currentUser?.displayName;

  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  const [searchQuery, setSearchQuery] = useState("");
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [createError, setCreateError] = useState("");

  const renameProjectMutation = useRenameProject();

  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [renameError, setRenameError] = useState("");

  const query = searchQuery.trim().toLowerCase();

  const visibleProjects = query
    ? projects.filter((project) =>
      (project.name || "").toLowerCase().includes(query)
    )
    : projects;

  const openCreateDialog = () => {
    setCreateError("");
    setNewProjectName("");
    setCreateDialogOpen(true);
  };

  useEffect(() => {
    if (location.state?.openCreateProjectDialog) {
      openCreateDialog();

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, navigate]);

  const closeCreateDialog = () => {
    if (createProjectMutation.isPending) return;

    setCreateDialogOpen(false);
    setCreateError("");
    setNewProjectName("");
  };

  const handleCreateProject = async () => {
    const trimmedName = newProjectName.trim();

    if (!trimmedName) {
      setCreateError("Project name is required.");
      return;
    }

    try {
      setCreateError("");

      await createProjectMutation.mutateAsync(trimmedName);

      setCreateDialogOpen(false);
      setNewProjectName("");
      onRefresh?.();
    } catch (error) {
      console.error("Failed to create project:", error);
      setCreateError(error?.message || "Failed to create project.");
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.id);

      setProjectToDelete(null);
      onRefresh?.();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const openRenameDialog = (project) => {
    setProjectToEdit(project);
    setEditProjectName(project.name || "");
    setRenameError("");
  };

  const closeRenameDialog = () => {
    if (renameProjectMutation.isPending) return;

    setProjectToEdit(null);
    setEditProjectName("");
    setRenameError("");
  };

  const handleRenameProject = async () => {
    const trimmedName = editProjectName.trim();

    if (!trimmedName) {
      setRenameError("Project name is required.");
      return;
    }

    try {
      setRenameError("");

      await renameProjectMutation.mutateAsync({
        projectId: projectToEdit.id,
        name: trimmedName,
      });

      setProjectToEdit(null);
      setEditProjectName("");
      onRefresh?.();
    } catch (error) {
      console.error("Failed to update project:", error);
      setRenameError(error?.message || "Failed to update project.");
    }
  };

  return (
    <div className="app-page fade-in">
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: "1.85rem" }}>
            {messages.welcome.hello}
            {userName ? `, ${userName}` : ""}{" "}
            <span style={{ color: "var(--accent)" }}>✦</span>
          </h1>

          <p className="page-subtitle">{messages.welcome.question}</p>
        </div>

        <button onClick={openCreateDialog} className="btn btn-primary btn-lg">
          <PlusIcon />
          New project
        </button>
      </header>

      <section className="card" style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <h2 className="section-title">My Projects</h2>

          <button onClick={onRefresh} className="btn btn-ghost btn-sm">
            Refresh
          </button>
        </div>

        <div className="search-box" style={{ marginBottom: "1.25rem" }}>
          <SearchIcon />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
          />
        </div>

        {projectsLoading && (
          <div className="projects-grid">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton" style={{ height: 150 }} />
            ))}
          </div>
        )}

        {!projectsLoading && projectsError && (
          <div className="status-error">{projectsError}</div>
        )}

        {!projectsLoading && !projectsError && projects.length === 0 && (
          <div className="empty-state" style={{ minHeight: 220 }}>
            <div className="empty-icon">📚</div>

            <h3 className="empty-title">No projects yet</h3>

            <p className="empty-text">
              Create your first project to start uploading materials and
              studying with AI.
            </p>

            <button onClick={openCreateDialog} className="btn btn-primary">
              <PlusIcon />
              Create project
            </button>
          </div>
        )}

        {!projectsLoading &&
          !projectsError &&
          projects.length > 0 &&
          visibleProjects.length === 0 && (
            <div className="empty-state" style={{ minHeight: 220 }}>
              <div className="empty-icon">🔍</div>

              <h3 className="empty-title">No matching projects</h3>

              <p className="empty-text">Try a different project name.</p>
            </div>
          )}

        {!projectsLoading && !projectsError && visibleProjects.length > 0 && (
          <div className="projects-grid">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDeleteClick={setProjectToDelete}
                onEditClick={openRenameDialog}
              />
            ))}
          </div>
        )}
      </section>

      <ProjectActionsDialog
        open={createDialogOpen}
        name={newProjectName}
        onNameChange={setNewProjectName}
        onSubmit={handleCreateProject}
        onClose={closeCreateDialog}
        creating={createProjectMutation.isPending}
        error={createError}
      />

      <ProjectActionsDialog
        open={!!projectToEdit}
        title="Rename project"
        description="Choose a new name for your study project."
        submitText="Save changes"
        submittingText="Saving..."
        name={editProjectName}
        onNameChange={setEditProjectName}
        onSubmit={handleRenameProject}
        onClose={closeRenameDialog}
        creating={renameProjectMutation.isPending}
        error={renameError}
      />

      <ConfirmDialog
        open={!!projectToDelete}
        title="Delete project?"
        message={`Are you sure you want to delete "${projectToDelete?.name || "Untitled"
          }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteProject}
        onCancel={() => setProjectToDelete(null)}
        loading={deleteProjectMutation.isPending}
      />
    </div>
  );
}

export default HomePage;