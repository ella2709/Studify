import { PlusIcon, SearchIcon } from "./iconsAndButtons";
import { Link } from "react-router-dom";
import { useState } from "react";
import { safeFormatDate } from "../helpers/dateHelper";
import messages from "../messages.js";
import { auth } from "../authentication/firebaseAuth";
import heroDecoration from "../assets/HomePhoto.png";

export function HomeContent({
  projects = [],
  projectsLoading,
  projectsError,
  onCreateProject,
  onRefresh,
}) {
  const userName = auth.currentUser?.displayName;
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();

  const visibleProjects = query
    ? projects.filter((project) =>
        (project.name || "").toLowerCase().includes(query)
      )
    : projects;

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100dvh - 72px)",
        maxHeight: "calc(100dvh - 72px)",
        minHeight: 0,
        position: "relative",
        overflow: "hidden",
        padding: "0 1.5rem 1rem",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at 10% 0%, rgba(214, 187, 148, 0.28) 0, transparent 28%), radial-gradient(circle at 92% 12%, rgba(190, 204, 174, 0.18) 0, transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.82), var(--bg-app) 72%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -90,
          width: 520,
          height: 300,
          borderRadius: "0 0 70% 0",
          background:
            "linear-gradient(135deg, rgba(214, 187, 148, 0.22), rgba(255,255,255,0))",
          filter: "blur(1px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1320px",
          height: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <section
          style={{
            height: 190,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "1.1rem 0 0.9rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "clamp(2.15rem, 4vw, 3.4rem)",
                fontWeight: 800,
                color: "var(--text)",
                margin: "0 0 0.25rem",
                lineHeight: 1,
                letterSpacing: "-0.055em",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              {messages.welcome.hello}
              {userName ? `, ${userName}` : ""}
              <span
                style={{
                  display: "inline-block",
                  marginLeft: "0.45rem",
                  color: "#d7b77f",
                  fontSize: "0.42em",
                  verticalAlign: "top",
                  transform: "translateY(0.35rem)",
                }}
              >
                ✦
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--text-2)",
                margin: "0 0 1.15rem",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              {messages.welcome.question}
            </p>

            <button
              onClick={onCreateProject}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "0.78rem 1.55rem",
                minWidth: 210,
                background:
                  "linear-gradient(180deg, #d5b27a 0%, #c79a5f 100%)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.45)",
                borderRadius: "1rem",
                fontSize: "0.95rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow:
                  "0 16px 34px rgba(171, 126, 66, 0.24), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              <PlusIcon />
              {messages.projects.create}
            </button>
          </div>

          <DecorativeStudyShelf />
        </section>

        <section
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.82)",
            border: "1px solid rgba(222, 216, 207, 0.88)",
            borderRadius: "1.7rem",
            padding: "1.45rem",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            boxShadow:
              "0 24px 70px rgba(33, 28, 20, 0.08), inset 0 1px 0 rgba(255,255,255,0.82)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "0.9rem",
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--text)",
                margin: 0,
                letterSpacing: "-0.035em",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              My Projects
            </h2>

            <button
              onClick={onRefresh}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.95rem",
                color: "var(--text-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.45rem 0.55rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
              }}
            >
              ↻ Refresh
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              width: "100%",
              marginBottom: "1.35rem",
              backgroundColor: "rgba(255,255,255,0.76)",
              border: "1px solid rgba(220, 214, 205, 0.95)",
              borderRadius: 999,
              padding: "0 1.15rem",
              height: 48,
              boxShadow: "inset 0 1px 2px rgba(33, 28, 20, 0.03)",
            }}
          >
            <SearchIcon />

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "var(--text)",
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
            />
          </div>

          {projectsLoading && (
            <div
              className="projects-grid"
              style={{ overflowY: "auto", minHeight: 0, paddingBottom: "0.35rem" }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 188, borderRadius: "1.2rem" }}
                />
              ))}
            </div>
          )}

          {!projectsLoading && projectsError && (
            <div className="status-error">{projectsError}</div>
          )}

          {!projectsLoading && !projectsError && projects.length === 0 && (
            <EmptyState title="No projects yet" text="Create your first project to get started." />
          )}

          {!projectsLoading &&
            !projectsError &&
            projects.length > 0 &&
            visibleProjects.length === 0 && (
              <EmptyState title="No matching projects" text="Try a different project name." />
            )}

          {!projectsLoading && !projectsError && visibleProjects.length > 0 && (
            <div
              className="projects-grid"
              style={{ overflowY: "auto", minHeight: 0, paddingBottom: "0.35rem" }}
            >
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DecorativeStudyShelf() {
  return (
    <img
      src={heroDecoration}
      alt=""
      aria-hidden="true"
      style={{
        position: "absolute",
        right: 24,
        bottom: 8,
        width: 270,
        opacity: 0.9,
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

function bookStyle(height, color) {
  return {
    display: "block",
    width: 28,
    height,
    borderRadius: "0.45rem 0.45rem 0.22rem 0.22rem",
    background: color,
    boxShadow: "inset -5px 0 8px rgba(0,0,0,0.06)",
  };
}

function EmptyState({ title, text }) {
  return (
    <div
      style={{
        padding: "3rem 2rem",
        textAlign: "center",
        backgroundColor: "rgba(255,255,255,0.55)",
        border: "1.5px dashed rgba(213, 203, 190, 0.95)",
        borderRadius: "1.25rem",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.875rem" }}>📚</div>

      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "var(--text)",
          margin: "0 0 0.375rem",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "0.9375rem",
          color: "var(--text-muted)",
          margin: 0,
        }}
      >
        {text}
      </p>
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
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(250,247,241,0.88))",
        border: `1.5px solid ${
          hovered ? "rgba(199, 154, 95, 0.7)" : "rgba(218, 211, 202, 0.95)"
        }`,
        borderRadius: "1.15rem",
        padding: "1.45rem 1.25rem 1.15rem",
        textDecoration: "none",
        color: "var(--text)",
        boxShadow: hovered
          ? "0 22px 42px rgba(43, 34, 22, 0.10)"
          : "0 12px 26px rgba(43, 34, 22, 0.05)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        minHeight: 165,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "1rem",
          background:
            "linear-gradient(145deg, rgba(213,178,122,0.16), rgba(255,255,255,0.85))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.35rem",
          marginBottom: "0.9rem",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        📚
      </div>

      <h3
        style={{
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "var(--text)",
          margin: "0 0 0.8rem",
          lineHeight: 1.35,
          letterSpacing: "-0.035em",
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

        {updatedAt && <span className="project-meta-pill">📅 {updatedAt}</span>}
      </div>
    </Link>
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
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!creating) onSubmit?.();
  };

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(32, 27, 20, 0.34)",
        backdropFilter: "blur(10px)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(250,247,241,0.94))",
          border: "1px solid rgba(222, 216, 207, 0.95)",
          borderRadius: "1.35rem",
          boxShadow:
            "0 28px 80px rgba(33, 28, 20, 0.18), inset 0 1px 0 rgba(255,255,255,0.85)",
          padding: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.1rem",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "var(--text)",
                fontSize: "1.45rem",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              Create new project
            </h2>
            <p
              style={{
                margin: "0.35rem 0 0",
                color: "var(--text-muted)",
                fontSize: "0.95rem",
              }}
            >
              Give your study project a clear name.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            style={{
              width: 34,
              height: 34,
              borderRadius: "0.8rem",
              border: "1px solid rgba(220, 214, 205, 0.95)",
              background: "rgba(255,255,255,0.7)",
              color: "var(--text-muted)",
              cursor: creating ? "not-allowed" : "pointer",
              fontSize: "1.15rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <label
          style={{
            display: "block",
            color: "var(--text)",
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "0.55rem",
          }}
        >
          Project name
        </label>

        <input
          value={name}
          onChange={(e) => onNameChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus
          placeholder="For example: Operating Systems"
          disabled={creating}
          style={{
            width: "100%",
            height: 48,
            borderRadius: "0.95rem",
            border: isFocused
              ? "1.5px solid rgba(199, 154, 95, 0.85)"
              : "1px solid rgba(220, 214, 205, 0.95)",
            outline: "none",
            padding: "0 1rem",
            boxSizing: "border-box",
            background: "rgba(255,255,255,0.86)",
            color: "var(--text)",
            fontSize: "1rem",
            boxShadow: isFocused
              ? "0 0 0 4px rgba(199, 154, 95, 0.12)"
              : "inset 0 1px 2px rgba(33, 28, 20, 0.03)",
          }}
        />

        {error && (
          <p
            style={{
              margin: "0.65rem 0 0",
              color: "#c0392b",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginTop: "1.35rem",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            style={{
              padding: "0.75rem 1.05rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(220, 214, 205, 0.95)",
              background: "rgba(255,255,255,0.72)",
              color: "var(--text)",
              fontWeight: 700,
              cursor: creating ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={creating || !String(name || "").trim()}
            style={{
              padding: "0.75rem 1.15rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(255,255,255,0.45)",
              background:
                creating || !String(name || "").trim()
                  ? "rgba(199, 154, 95, 0.48)"
                  : "linear-gradient(180deg, #d5b27a 0%, #c79a5f 100%)",
              color: "#fff",
              fontWeight: 800,
              cursor:
                creating || !String(name || "").trim() ? "not-allowed" : "pointer",
              boxShadow: "0 12px 26px rgba(171, 126, 66, 0.18)",
            }}
          >
            {creating ? "Creating..." : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}
