import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

import { API } from "./api";
import QuestionsPage from "./pages/questionsPage";
import SummarizePage from "./pages/summarizePage";
import UploadMaterialPage from "./pages/uploadMaterialPage";
import ProjectPage from "./pages/projectPage";

const SIDEBAR_W = 264;

/* ── Mobile detection ────────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

/* ── App ─────────────────────────────────────────────────── */
function App() {
  const isMobile = useIsMobile();
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Projects loaded from real backend data (not from a non-existent /api/projects endpoint).
  // The backend stores everything under users/defaultUser/projects/defaultProject.
  // We assemble the project's stats from the APIs that DO exist.
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const loadProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      setProjectsError("");
      const res = await fetch(API.GET_PROJECTS);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setProjectsError(err.message);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;
    try {
      setCreating(true);
      setCreateError("");
      const res = await fetch(API.CREATE_PROJECT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      setNewProjectName("");
      setIsCreateOpen(false);
      await loadProjects();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  const openCreate = () => setIsCreateOpen(true);
  const closeCreate = () => {
    setIsCreateOpen(false);
    setNewProjectName("");
    setCreateError("");
  };
  const closeSidebarOnMobile = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  const mainPaddingLeft = isSidebarOpen && !isMobile ? SIDEBAR_W : 0;
  const mainPadding = isMobile ? "1.25rem 1rem 2rem" : "2rem 2.5rem 3rem";

  return (
    <div
      style={{ backgroundColor: "var(--bg-app)", color: "var(--text)", minHeight: "100vh" }}
      dir="ltr"
    >
      {/* Mobile backdrop */}
      {isSidebarOpen && isMobile && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 19,
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: isSidebarOpen ? 0 : -SIDEBAR_W,
          width: SIDEBAR_W,
          height: "100vh",
          backgroundColor: "var(--sidebar-bg)",
          display: "flex",
          flexDirection: "column",
          transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 20,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Sidebar
          projects={projects}
          projectsLoading={projectsLoading}
          isDark={isDark}
          onToggleDark={() => setIsDark((d) => !d)}
          onCreateProject={openCreate}
          onNavClick={closeSidebarOnMobile}
        />
      </aside>

      {/* Main */}
      <div
        style={{
          paddingLeft: mainPaddingLeft,
          transition: "padding-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
        />
        <main style={{ flex: 1, padding: mainPadding }}>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  projects={projects}
                  projectsLoading={projectsLoading}
                  projectsError={projectsError}
                  onCreateProject={openCreate}
                  onRefresh={loadProjects}
                />
              }
            />
            <Route path="/project/:projectId" element={<ProjectPage />} />
            <Route path="/project/:projectId/upload" element={<UploadMaterialPage />} />
            <Route path="/project/:projectId/questions" element={<QuestionsPage />} />
            <Route path="/project/:projectId/summarize" element={<SummarizePage />} />
          </Routes>
        </main>
      </div>

      {/* Create Project Modal */}
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
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────── */
function Sidebar({ projects, projectsLoading, isDark, onToggleDark, onCreateProject, onNavClick }) {
  const location = useLocation();

  return (
    <>
      {/* Logo */}
      <div
        style={{
          padding: "1.375rem 1.25rem 1.125rem",
          borderBottom: "1px solid var(--sidebar-border)",
          flexShrink: 0,
        }}
      >
        <Link
          to="/"
          onClick={onNavClick}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "0.625rem",
              backgroundColor: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "#fff",
              fontSize: "1.125rem",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(200,167,122,0.4)",
            }}
          >
            S
          </div>
          <div>
            <div style={{ color: "var(--sidebar-text)", fontWeight: 700, fontSize: "1rem", lineHeight: 1.25 }}>
              Studify
            </div>
            <div style={{ color: "var(--sidebar-text-2)", fontSize: "0.6875rem" }}>
              AI Learning Workspace
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.875rem 0.875rem 0", overflowY: "auto" }}>
        {/* Home link */}
        <SidebarNavItem
          to="/"
          label="Home"
          icon={<HomeIcon />}
          active={location.pathname === "/"}
          onClick={onNavClick}
        />

        {/* My Projects section */}
        <div style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 0.625rem",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--sidebar-text-2)",
              }}
            >
              My Projects
            </span>
            <button
              onClick={onCreateProject}
              title="New project"
              style={{
                width: 22,
                height: 22,
                borderRadius: "0.375rem",
                border: "none",
                backgroundColor: "rgba(255,255,255,0.09)",
                color: "var(--sidebar-text-2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                lineHeight: 1,
                padding: 0,
                transition: "background-color 0.14s, color 0.14s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)";
                e.currentTarget.style.color = "var(--sidebar-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.09)";
                e.currentTarget.style.color = "var(--sidebar-text-2)";
              }}
            >
              +
            </button>
          </div>

          {/* Skeleton while loading */}
          {projectsLoading && (
            <div style={{ padding: "0 0.125rem" }}>
              {[1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: 32, marginBottom: 4, borderRadius: "0.5rem" }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!projectsLoading && projects.length === 0 && (
            <button
              onClick={onCreateProject}
              style={{
                width: "100%",
                padding: "0.5rem 0.625rem",
                background: "none",
                border: "1px dashed rgba(255,255,255,0.12)",
                borderRadius: "0.5rem",
                color: "var(--sidebar-text-2)",
                fontSize: "0.8125rem",
                cursor: "pointer",
                textAlign: "center",
                transition: "border-color 0.14s, color 0.14s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                e.currentTarget.style.color = "var(--sidebar-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "var(--sidebar-text-2)";
              }}
            >
              + Create project
            </button>
          )}

          {/* Project list */}
          {projects.map((project) => {
            const name = project.name || project.title || "Untitled";
            const path = `/project/${project.id}`;
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={project.id}
                to={path}
                state={{ projectName: name }}
                onClick={onNavClick}
                title={name}
                style={{
                  display: "block",
                  padding: "0.5rem 0.625rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text-2)",
                  backgroundColor: isActive ? "var(--sidebar-active)" : "transparent",
                  textDecoration: "none",
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.14s, color 0.14s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--sidebar-hover)";
                    e.currentTarget.style.color = "var(--sidebar-text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--sidebar-text-2)";
                  }
                }}
              >
                {name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Dark mode toggle */}
      <div
        style={{
          padding: "0.875rem 1.125rem",
          borderTop: "1px solid var(--sidebar-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--sidebar-text-2)",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          <span>{isDark ? "🌙" : "☀️"}</span>
          <span>{isDark ? "Dark" : "Light"}</span>
        </span>
        <button
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            backgroundColor: isDark ? "var(--accent)" : "rgba(255,255,255,0.2)",
            position: "relative",
            transition: "background-color 0.2s",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: isDark ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>
    </>
  );
}

function SidebarNavItem({ to, label, icon, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.5625rem 0.625rem",
        borderRadius: "0.625rem",
        fontSize: "0.9rem",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--sidebar-active-text)" : "var(--sidebar-text-2)",
        backgroundColor: active ? "var(--sidebar-active)" : "transparent",
        textDecoration: "none",
        marginBottom: 2,
        transition: "background-color 0.14s, color 0.14s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "var(--sidebar-hover)";
          e.currentTarget.style.color = "var(--sidebar-text)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--sidebar-text-2)";
        }
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

/* ── TopBar ──────────────────────────────────────────────── */
function TopBar({ isSidebarOpen, onToggleSidebar }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0 1.375rem",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--bg-app)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        height: "var(--topbar-h)",
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        style={{
          width: 36,
          height: 36,
          borderRadius: "0.5rem",
          border: "none",
          backgroundColor: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-2)",
          transition: "background-color 0.14s, color 0.14s",
          flexShrink: 0,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg-raised)";
          e.currentTarget.style.color = "var(--text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--text-2)";
        }}
      >
        <HamburgerIcon open={isSidebarOpen} />
      </button>

      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flex: 1,
          maxWidth: 480,
          backgroundColor: "var(--bg-surface)",
          border: "1.5px solid var(--border)",
          borderRadius: 999,
          padding: "0 1rem",
          height: 38,
          boxShadow: "var(--shadow-sm)",
          cursor: "text",
        }}
      >
        <SearchIcon />
        <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", userSelect: "none" }}>
          Search projects, files, conversations...
        </span>
      </div>
    </header>
  );
}

/* ── HomePage ────────────────────────────────────────────── */
function HomePage({ projects, projectsLoading, projectsError, onCreateProject, onRefresh }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Hero */}
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

      {/* Create project */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "3rem",
        }}
      >
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
            transition: "background-color 0.15s, transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-dark)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 28px var(--accent-glow)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 4px 20px var(--accent-glow)";
          }}
        >
          <PlusIcon />
          Create New Project
        </button>
      </div>

      {/* My Projects section */}
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
              transition: "color 0.14s, background-color 0.14s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.backgroundColor = "var(--bg-raised)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Loading */}
        {projectsLoading && (
          <div className="projects-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 188, borderRadius: "1rem" }} />
            ))}
          </div>
        )}

        {/* Error */}
        {!projectsLoading && projectsError && (
          <div className="status-error">{projectsError}</div>
        )}

        {/* Empty */}
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
            <div style={{ fontSize: "2.75rem", marginBottom: "0.875rem" }}>📚</div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text)", margin: "0 0 0.375rem" }}>
              No projects yet
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", margin: "0 0 1.5rem" }}>
              Create your first project to get started.
            </p>
            <button onClick={onCreateProject} className="btn btn-accent">
              <PlusIcon /> Create New Project
            </button>
          </div>
        )}

        {/* Projects */}
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

/* ── Date formatting helper ──────────────────────────────── */
// Handles every shape a date can arrive from the backend:
//   1. Firestore Timestamp from Admin SDK: { _seconds, _nanoseconds }
//   2. Firestore Timestamp from client SDK: { seconds, nanoseconds }
//   3. ISO / numeric string
//   4. Plain JS Date
//   5. null / undefined / anything else → returns null
function safeFormatDate(value) {
  if (!value) return null;

  if (typeof value === "object" && !(value instanceof Date)) {
    const secs = value._seconds ?? value.seconds;
    if (typeof secs === "number") {
      return new Date(secs * 1000).toLocaleDateString();
    }
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toLocaleDateString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString();
  }

  return null;
}

/* ── ProjectCard ─────────────────────────────────────────── */
function ProjectCard({ project }) {
  const [hovered, setHovered] = useState(false);
  const name = project.name || project.title || "Untitled";
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
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        minHeight: 188,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
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
          boxShadow: hovered ? "0 4px 12px var(--accent-glow)" : "none",
          transition: "box-shadow 0.2s",
        }}
      >
        📚
      </div>

      {/* Name (centered) */}
      <h3
        style={{
          fontSize: "1.0625rem",
          fontWeight: 700,
          color: "var(--text)",
          margin: "0 0 1rem",
          lineHeight: 1.35,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {name}
      </h3>

      {/* Meta row */}
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
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "0.2rem 0.625rem",
            }}
          >
            📎 {filesCount} files
          </span>
        )}
        {chatsCount !== undefined && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "0.2rem 0.625rem",
            }}
          >
            💬 {chatsCount} chats
          </span>
        )}
        {updatedAt && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "0.2rem 0.625rem",
            }}
          >
            🕘 {updatedAt}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── Create Project Modal ────────────────────────────────── */
function CreateProjectModal({ name, onNameChange, onSubmit, onClose, creating, error }) {
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
        <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.375rem" }}>
          Create New Project
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-2)", margin: "0 0 1.5rem" }}>
          Give your project a name to get started.
        </p>

        <label
          style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.5rem" }}
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

        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
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

/* ── Icons ───────────────────────────────────────────────── */
function HamburgerIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <line x1="3" y1="3" x2="15" y2="15" />
          <line x1="15" y1="3" x2="3" y2="15" />
        </>
      ) : (
        <>
          <line x1="2" y1="5" x2="16" y2="5" />
          <line x1="2" y1="9" x2="16" y2="9" />
          <line x1="2" y1="13" x2="16" y2="13" />
        </>
      )}
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ flexShrink: 0 }}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-muted)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default App;
