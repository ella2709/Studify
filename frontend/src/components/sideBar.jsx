import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HamburgerIcon, SearchIcon, HomeIcon } from "./iconsAndButtons";

/* ── Sidebar ─────────────────────────────────────────────── */
export function Sidebar({
  projects,
  projectsLoading,
  isDark,
  onToggleDark,
  onCreateProject,
  onNavClick,
}) {
  const location = useLocation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: "1.25rem 1.125rem 1rem",
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
          <img
            src="/Logo.png"
            alt="Studify"
            style={{
              height: 34,
              width: 34,
              objectFit: "contain",
              borderRadius: "0.5rem",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                color: "var(--sidebar-text)",
                fontWeight: 700,
                fontSize: "1rem",
                lineHeight: 1.2,
              }}
            >
              Studify
            </div>
            <div
              style={{
                color: "var(--sidebar-text-2)",
                fontSize: "0.6875rem",
                marginTop: 1,
              }}
            >
              AI Learning Workspace
            </div>
          </div>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav
        style={{
          flex: 1,
          padding: "0.875rem 0.875rem 0",
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

        {/* Projects section */}
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
                transition: "background-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.18)";
                e.currentTarget.style.color = "var(--sidebar-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.09)";
                e.currentTarget.style.color = "var(--sidebar-text-2)";
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
                  style={{ height: 30, marginBottom: 4, borderRadius: "0.5rem" }}
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
                border: "1px dashed rgba(255,255,255,0.14)",
                borderRadius: "0.5rem",
                color: "var(--sidebar-text-2)",
                fontSize: "0.8125rem",
                cursor: "pointer",
                textAlign: "center",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.28)";
                e.currentTarget.style.color = "var(--sidebar-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.14)";
                e.currentTarget.style.color = "var(--sidebar-text-2)";
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
      </nav>

      {/* ── Dark mode toggle ── */}
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
            gap: "0.4rem",
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
            transition: "background-color 0.2s",
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
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </button>
      </div>
    </div>
  );
}

/* ── Sidebar nav item ────────────────────────────────────── */
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
        transition: "background-color 0.15s, color 0.15s",
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

/* ── Sidebar project item ────────────────────────────────── */
function SidebarProjectItem({ to, name, isActive, onClick }) {
  return (
    <Link
      to={to}
      state={{ projectName: name }}
      onClick={onClick}
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
        transition: "background-color 0.15s, color 0.15s",
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
}

/* ── Top bar ─────────────────────────────────────────────── */
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
      {/* Hamburger button */}
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
          transition: "background-color 0.15s, color 0.15s",
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
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
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
