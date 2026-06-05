import { Link } from "react-router-dom";
import { HamburgerIcon, SearchIcon, HomeIcon } from "./iconsAndButtons";
import { useLocation } from "react-router-dom";


export function Sidebar({ projects, projectsLoading, isDark, onToggleDark, onCreateProject, onNavClick }) {
  const location = useLocation();

  return (
    <>
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
          }}
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
            <div
              style={{
                color: "var(--sidebar-text)",
                fontWeight: 700,
                fontSize: "1rem",
                lineHeight: 1.25,
              }}
            >
              Studify
            </div>

            <div
              style={{
                color: "var(--sidebar-text-2)",
                fontSize: "0.6875rem",
              }}
            >
              AI Learning Workspace
            </div>
          </div>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "0.875rem 0.875rem 0", overflowY: "auto" }}>
        <SidebarNavItem
          to="/"
          label="Home"
          icon={<HomeIcon />}
          active={location.pathname === "/"}
          onClick={onNavClick}
        />

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
              }}
            >
              +
            </button>
          </div>

          {projectsLoading && (
            <div style={{ padding: "0 0.125rem" }}>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 32, marginBottom: 4, borderRadius: "0.5rem" }}
                />
              ))}
            </div>
          )}

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
              }}
            >
              + Create project
            </button>
          )}

          {projects.map((project) => {
            const name = project.name || "Untitled";
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
                  color: isActive
                    ? "var(--sidebar-active-text)"
                    : "var(--sidebar-text-2)",
                  backgroundColor: isActive ? "var(--sidebar-active)" : "transparent",
                  textDecoration: "none",
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </Link>
            );
          })}
        </div>
      </nav>

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


export function SidebarNavItem({ to, label, icon, active, onClick }) {
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
      }}
    >
      {icon}
      {label}
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
          flexShrink: 0,
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
          cursor: "text",
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