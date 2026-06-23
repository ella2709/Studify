import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../authentication/firebaseAuth";
import { HomeIcon, PlusIcon, PanelIcon } from "./iconsAndButtons";

function projectInitial(name = "") {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "•";
}

export function Sidebar({
  collapsed,
  onToggle,
  projects = [],
  projectsLoading,
  isDark,
  onToggleDark,
  onCreateProject,
  onNavClick,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [projectsOpen, setProjectsOpen] = useState(true);

  async function handleLogout() {
    try {
      await signOut(auth);
      onNavClick?.();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    }
  }

  /* ───────────── Collapsed (icon rail) ───────────── */
  if (collapsed) {
    return (
      <div className="sb sb--collapsed">
        <div className="sb-railtop">
          <Link to="/" onClick={onNavClick} className="sb-rail-logo" title="Studify">
            <img src="/Logo.png" alt="Studify" />
          </Link>
          <button className="sb-rail-btn" onClick={onToggle} title="Expand sidebar" aria-label="Expand sidebar">
            <PanelIcon />
          </button>
        </div>

        <nav className="sb-rail-nav">
          <Link
            to="/"
            onClick={onNavClick}
            className={`sb-rail-btn${location.pathname === "/" ? " active" : ""}`}
            title="Home"
          >
            <HomeIcon />
          </Link>

          <button className="sb-rail-btn" onClick={onCreateProject} title="New project" aria-label="New project">
            <PlusIcon />
          </button>

          {projects.length > 0 && <div className="sb-rail-divider" />}

          {projects.map((project) => {
            const name = project.name || "Untitled";
            const path = `/project/${project.id}`;
            return (
              <Link
                key={project.id}
                to={path}
                state={{ projectName: name }}
                onClick={onNavClick}
                className={`sb-rail-proj${location.pathname.startsWith(path) ? " active" : ""}`}
                title={name}
              >
                {projectInitial(name)}
              </Link>
            );
          })}
        </nav>

        <div className="sb-railfoot">
          <button className="sb-rail-btn" onClick={onToggleDark} title={isDark ? "Light mode" : "Dark mode"} aria-label="Toggle theme">
            {isDark ? "🌙" : "☀️"}
          </button>
          <button className="sb-rail-btn sb-rail-btn--logout" onClick={handleLogout} title="Log out" aria-label="Log out">
            <LogoutIcon />
          </button>
        </div>
      </div>
    );
  }

  /* ───────────── Expanded ───────────── */
  return (
    <div className="sb">
      <div className="sb-top">
        <Link to="/" onClick={onNavClick} className="sb-brand">
          <img src="/Logo.png" alt="Studify" className="sb-brand__logo" />
          <div style={{ minWidth: 0 }}>
            <div className="sb-brand__name">Studify</div>
            <div className="sb-brand__tag">AI Study Assistant</div>
          </div>
        </Link>
        <button className="sb-collapse-btn" onClick={onToggle} title="Collapse sidebar" aria-label="Collapse sidebar">
          <PanelIcon />
        </button>
      </div>

      <nav className="sb-nav">
        <SidebarNavItem
          to="/"
          label="Home"
          icon={<HomeIcon />}
          active={location.pathname === "/"}
          onClick={onNavClick}
        />

        <div className="sb-section">
          <button className="sb-section__btn" onClick={() => setProjectsOpen((prev) => !prev)}>
            <span className="sb-section__label">My Projects</span>
            <Chevron open={projectsOpen} />
          </button>

          <button className="sb-add" onClick={onCreateProject} title="Create new project" aria-label="Create new project">
            +
          </button>
        </div>

        {projectsOpen && (
          <div>
            {projectsLoading &&
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 36, margin: "0 0.6rem 6px", borderRadius: "var(--r-sm)" }}
                />
              ))}

            {!projectsLoading && projects.length === 0 && (
              <div style={{ padding: "0.5rem 0.6rem", color: "var(--sidebar-text-2)", fontSize: "0.83rem" }}>
                No projects yet
              </div>
            )}

            {!projectsLoading &&
              projects.map((project) => {
                const name = project.name || "Untitled";
                const path = `/project/${project.id}`;
                return (
                  <SidebarProjectItem
                    key={project.id}
                    to={path}
                    name={name}
                    isActive={location.pathname.startsWith(path)}
                    onClick={onNavClick}
                  />
                );
              })}
          </div>
        )}
      </nav>

      <div className="sb-footer">
        <div className="theme-toggle">
          <span className="theme-toggle__label">
            <span>{isDark ? "🌙" : "☀️"}</span>
            <span>{isDark ? "Dark mode" : "Light mode"}</span>
          </span>
          <button onClick={onToggleDark} aria-label="Toggle dark mode" className={`switch${isDark ? " on" : ""}`}>
            <span className="switch__knob" />
          </button>
        </div>

        <button onClick={handleLogout} className="sb-logout">
          <LogoutIcon />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}

export function SidebarNavItem({ to, label, icon, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={`sb-link${active ? " active" : ""}`}>
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
      className={`sb-project${isActive ? " active" : ""}`}
    >
      <span className="sb-project__dot" />
      <span className="sb-project__name">{name}</span>
    </Link>
  );
}

function Chevron({ open }) {
  return (
    <span style={{ display: "inline-flex", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.18s ease" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
