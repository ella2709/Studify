
import { PlusIcon }  from "./iconsAndButtons";
import { Link } from "react-router-dom";
import { useState } from "react";
import { safeFormatDate } from "../helpers/dateHelper";

export function HomeContent({ projects, projectsLoading, projectsError, onCreateProject, onRefresh }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: "2.75rem" }}>
        <h1
          style={{
            fontSize: "2.375rem",
            fontWeight: 800,
            color: "var(--text)",
            margin: "0 0 0.5rem",
            lineHeight: 1.15,
          }}
        >
          Hello 👋
        </h1>

        <p style={{ fontSize: "1.125rem", color: "var(--text-2)", margin: 0 }}>
          What will we study today?
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
        <button
          onClick={onCreateProject}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "1rem 2.25rem",
            backgroundColor: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "1rem",
            fontSize: "1.0625rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 20px var(--accent-glow)",
          }}
        >
          <PlusIcon />
          Create New Project
        </button>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <h2
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              margin: 0,
            }}
          >
            My Projects
          </h2>

          <button
            onClick={onRefresh}
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {projectsLoading && (
          <div className="projects-grid">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 188, borderRadius: "1rem" }}
              />
            ))}
          </div>
        )}

        {!projectsLoading && projectsError && (
          <div className="status-error">{projectsError}</div>
        )}

        {!projectsLoading && !projectsError && projects.length === 0 && (
          <div
            style={{
              padding: "3.5rem 2rem",
              textAlign: "center",
              backgroundColor: "var(--bg-surface)",
              border: "1.5px dashed var(--border)",
              borderRadius: "1rem",
            }}
          >
            <div style={{ fontSize: "2.75rem", marginBottom: "0.875rem" }}>
              📚
            </div>

            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--text)",
                margin: "0 0 0.375rem",
              }}
            >
              No projects yet
            </h3>

            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                margin: "0 0 1.5rem",
              }}
            >
              Create your first project to get started.
            </p>

            <button onClick={onCreateProject} className="btn btn-accent">
              <PlusIcon /> Create New Project
            </button>
          </div>
        )}

        {!projectsLoading && !projectsError && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


export function ProjectCard({ project }) {
  const [hovered, setHovered] = useState(false);

  const name = project.name || "Untitled";
  const filesCount = project.filesCount ?? project.files;
  const chatsCount = project.chatsCount ?? project.chats;
  const updatedAt = safeFormatDate(project.updatedAt ?? project.updated);

  return (
    <Link
      to={`/project/${project.id}`}
      state={{ projectName: name }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "var(--bg-surface)",
        border: `1.5px solid ${hovered ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "1.125rem",
        padding: "2rem 1.5rem 1.5rem",
        textDecoration: "none",
        color: "var(--text)",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-card)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        minHeight: 188,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "0.875rem",
          backgroundColor: "var(--accent-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        📚
      </div>

      <h3
        style={{
          fontSize: "1.0625rem",
          fontWeight: 700,
          color: "var(--text)",
          margin: "0 0 1rem",
          lineHeight: 1.35,
        }}
      >
        {name}
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.625rem",
          justifyContent: "center",
          marginTop: "auto",
        }}
      >
        {filesCount !== undefined && (
          <span className="project-meta-pill">📎 {filesCount} files</span>
        )}

        {chatsCount !== undefined && (
          <span className="project-meta-pill">💬 {chatsCount} chats</span>
        )}

        {updatedAt && (
          <span className="project-meta-pill">🕘 {updatedAt}</span>
        )}
      </div>
    </Link>
  );
}

export function CreateProjectModal({ name, onNameChange, onSubmit, onClose, creating, error }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          backgroundColor: "var(--bg-surface)",
          borderRadius: "1.375rem",
          padding: "2rem",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontSize: "1.375rem",
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 0.375rem",
          }}
        >
          Create New Project
        </h2>

        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-2)",
            margin: "0 0 1.5rem",
          }}
        >
          Give your project a name to get started.
        </p>

        <label
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--text)",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Project name
        </label>

        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !creating && onSubmit()}
          placeholder="e.g. Biology Midterm"
          className="input-base"
          autoFocus
        />

        {error && (
          <div className="status-error" style={{ marginTop: "0.875rem" }}>
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={!name.trim() || creating}
            className="btn btn-accent"
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}