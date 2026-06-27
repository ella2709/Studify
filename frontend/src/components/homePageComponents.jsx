import { PlusIcon, SearchIcon, TrashIcon } from "./iconsAndButtons";
import { Link } from "react-router-dom";
import { useState } from "react";
import { safeFormatDate } from "../helpers/dateHelper";
import messages from "../messages.js";
import { auth } from "../authentication/firebaseAuth";
import ConfirmDialog from "./ConfirmDialog";

export function HomeContent({
  projects = [],
  projectsLoading,
  projectsError,
  onCreateProject,
  onRefresh,
  onDeleteProject,
}) {
  const userName = auth.currentUser?.displayName;
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();
  const visibleProjects = query
    ? projects.filter((p) => (p.name || "").toLowerCase().includes(query))
    : projects;

  return (
    <div className="app-page fade-in">
      {/* Greeting bar */}
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
            {userName ? `, ${userName}` : ""} <span style={{ color: "var(--accent)" }}>✦</span>
          </h1>
          <p className="page-subtitle">{messages.welcome.question}</p>
        </div>

        <button onClick={onCreateProject} className="btn btn-primary btn-lg">
          <PlusIcon />
          New project
        </button>
      </header>

      {/* Projects panel */}
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
            <RefreshIcon /> Refresh
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 150 }} />
            ))}
          </div>
        )}

        {!projectsLoading && projectsError && (
          <div className="status-error">{projectsError}</div>
        )}

        {!projectsLoading && !projectsError && projects.length === 0 && (
          <EmptyState
            icon="📚"
            title="No projects yet"
            text="Create your first project to start uploading materials and studying with AI."
            action={
              <button onClick={onCreateProject} className="btn btn-primary">
                <PlusIcon /> Create project
              </button>
            }
          />
        )}

        {!projectsLoading &&
          !projectsError &&
          projects.length > 0 &&
          visibleProjects.length === 0 && (
            <EmptyState icon="🔍" title="No matching projects" text="Try a different project name." />
          )}

        {!projectsLoading && !projectsError && visibleProjects.length > 0 && (
          <div className="projects-grid">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onDeleteProject={onDeleteProject}/>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function ProjectCard({ project, onDeleteProject }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const name = project.name || "Untitled";
  const filesCount = project.filesCount ?? project.files;
  const chatsCount = project.chatsCount ?? project.chats;
  const updatedAt = safeFormatDate(project.updatedAt ?? project.updated);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeleteProject?.(project.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Link to={`/project/${project.id}`} state={{ projectName: name }} className="project-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="project-card__icon">📚</div>

          <button
            type="button"
            onClick={handleDeleteClick}
            aria-label="Delete project"
            title="Delete project"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "0.25rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrashIcon />
          </button>
        </div>

        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={name}
        >
          {name}
        </h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "auto" }}>
          {filesCount !== undefined && <span className="meta-pill">📎 {filesCount} files</span>}
          {chatsCount !== undefined && <span className="meta-pill">💬 {chatsCount} chats</span>}
          {updatedAt && <span className="meta-pill">🕑 {updatedAt}</span>}
        </div>
      </Link>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete project?"
        message={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}

export function EmptyState({ icon = "📦", title, text, action }) {
  return (
    <div className="empty-state" style={{ minHeight: 220 }}>
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-text">{text}</p>
      {action && <div style={{ marginTop: "1rem" }}>{action}</div>}
    </div>
  );
}

export function CreateProjectModal({
  name,
  onNameChange,
  onSubmit,
  onClose,
  creating,
  error,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!creating) onSubmit?.();
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.1rem" }}>
          <div>
            <h2 className="modal-title">Create new project</h2>
            <p className="modal-text" style={{ margin: "0.3rem 0 0" }}>
              Give your study project a clear name.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={creating} className="modal-close" aria-label="Close">
            ×
          </button>
        </div>

        <div className="field">
          <label className="field-label">Project name</label>
          <input
            value={name}
            onChange={(e) => onNameChange?.(e.target.value)}
            autoFocus
            placeholder="For example: Operating Systems"
            disabled={creating}
            className="input-base"
          />
        </div>

        {error && <p className="status-error" style={{ marginTop: "0.75rem" }}>{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={creating} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={creating || !String(name || "").trim()} className="btn btn-primary">
            {creating ? "Creating..." : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
