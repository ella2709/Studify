import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HamburgerIcon, SearchIcon, HomeIcon } from "./iconsAndButtons";

export function Sidebar({
  projects,
  projectsLoading,
  isDark,
  onToggleDark,
  onCreateProject,
  onNavClick,
}) {
  const location = useLocation();
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          padding: "1.3rem 1rem 1.15rem",
          borderBottom: "1px solid var(--sidebar-border)",
          flexShrink: 0,
        }}
      >
        <Link
          to="/"
          onClick={onNavClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.9rem",
            textDecoration: "none",
          }}
        >
          <img
            src="/Logo.png"
            alt="Studify"
            style={{
              width: 58,
              height: 58,
              objectFit: "contain",
              borderRadius: "0.9rem",
              background: "#fff",
              padding: 5,
              flexShrink: 0,
            }}
          />

          <div>
            <div
              style={{
                color: "var(--sidebar-text)",
                fontWeight: 750,
                fontSize: "1.28rem",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Studify
            </div>

            <div
              style={{
                color: "var(--sidebar-text-2)",
                fontSize: "0.9rem",
                marginTop: 4,
                fontWeight: 450,
              }}
            >
              AI Study Assistant
            </div>
          </div>
        </Link>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "1rem 0.75rem 0",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <SidebarNavItem
          to="/"
          label="Home"
          icon={<HomeIcon />}
          active={location.pathname === "/"}
          onClick={onNavClick}
        />

        <div style={{ marginTop: "1.35rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0 0.45rem",
              marginBottom: "0.55rem",
            }}
          >
            <button
              onClick={() => setProjectsOpen((prev) => !prev)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.35rem 0",
                color: "var(--sidebar-active-text)",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 750,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                }}
              >
                My Projects
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  transform: projectsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.18s ease",
                  color: "var(--sidebar-active-text)",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>

            <button
              onClick={onCreateProject}
              title="Create new project"
              style={{
                width: 31,
                height: 31,
                borderRadius: "0.65rem",
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "var(--sidebar-text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                lineHeight: 1,
                padding: 0,
              }}
            >
              +
            </button>
          </div>

          {projectsOpen && (
            <div style={{ marginLeft: "2.05rem" }}>
              {projectsLoading && (
                <div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="skeleton"
                      style={{
                        height: 34,
                        marginBottom: 7,
                        borderRadius: "0.65rem",
                      }}
                    />
                  ))}
                </div>
              )}

              {!projectsLoading && projects.length === 0 && (
                <button
                  onClick={onCreateProject}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.7rem",
                    background: "rgba(255,255,255,0.035)",
                    border: "1px dashed rgba(255,255,255,0.15)",
                    borderRadius: "0.75rem",
                    color: "var(--sidebar-text-2)",
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    textAlign: "center",
                    fontFamily: "inherit",
                  }}
                >
                  + Create project
                </button>
              )}

              {!projectsLoading &&
                projects.map((project) => {
                  const name = project.name || "Untitled";
                  const path = `/project/${project.id}`;
                  const isActive = location.pathname.startsWith(path);

                  return (
                    <SidebarProjectItem
                      key={project.id}
                      to={path}
                      name={name}
                      isActive={isActive}
                      onClick={onNavClick}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </nav>

      <div
        style={{
          padding: "0.95rem 1.15rem",
          borderTop: "1px solid var(--sidebar-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "0.9rem",
            color: "var(--sidebar-text-2)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 500,
          }}
        >
          <span>{isDark ? "🌙" : "☀️"}</span>
          <span>{isDark ? "Dark" : "Light"}</span>
        </span>

        <button
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          style={{
            width: 48,
            height: 26,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            backgroundColor: isDark ? "var(--accent)" : "rgba(255,255,255,0.2)",
            position: "relative",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: isDark ? 25 : 3,
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "#fff",
              boxShadow: "0 1px 5px rgba(0,0,0,0.35)",
              transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </button>
      </div>
    </div>
  );
}

export function SidebarNavItem({ to, label, icon, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.7rem",
        padding: "0.78rem 0.8rem",
        borderRadius: "0.85rem",
        fontSize: "0.95rem",
        fontWeight: active ? 700 : 550,
        color: active ? "var(--sidebar-active-text)" : "var(--sidebar-text-2)",
        backgroundColor: active ? "var(--sidebar-active)" : "transparent",
        textDecoration: "none",
        marginBottom: 4,
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SidebarProjectItem({ to, name, isActive, onClick }) {
  return (
    <Link
      to={to}
      state={{ projectName: name }}
      onClick={onClick}
      title={name}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0.68rem 0.25rem",
        borderRadius: "0.7rem",
        fontSize: "0.92rem",
        fontWeight: isActive ? 700 : 500,
        color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text-2)",
        backgroundColor: isActive ? "var(--sidebar-active)" : "transparent",
        textDecoration: "none",
        marginBottom: 3,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
    </Link>
  );
}

export function TopBar({ isSidebarOpen, onToggleSidebar }) {
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
          padding: 0,
        }}
      >
        <HamburgerIcon open={isSidebarOpen} />
      </button>

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
        }}
      >
        <SearchIcon />
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            userSelect: "none",
          }}
        >
          Search projects, files, conversations...
        </span>
      </div>
    </header>
  );
}