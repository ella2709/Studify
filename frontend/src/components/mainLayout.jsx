import { useState } from "react";
import { Sidebar } from "./sideBar";
import { useRecentChatsByProject } from "../services/questionService";

const SIDEBAR_W = 268;
const SIDEBAR_W_COLLAPSED = 76;

function readCollapsed() {
  try {
    return localStorage.getItem("sb-collapsed") === "1";
  } catch {
    return false;
  }
}

export function MainLayout({
  children,
  projects,
  projectsLoading,
  isDark,
  onToggleDark,
  onCreateProject,
}) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  // Warm the react-query cache for each project's chats so the chat pages
  // open instantly. (Result intentionally unused here.)
  useRecentChatsByProject(projects || []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("sb-collapsed", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const width = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <>
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width,
          height: "100vh",
          zIndex: 20,
          transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          projects={projects}
          projectsLoading={projectsLoading}
          isDark={isDark}
          onToggleDark={onToggleDark}
          onCreateProject={onCreateProject}
        />
      </aside>

      <div
        style={{
          paddingLeft: width,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "padding-left 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <main className="app-main">{children}</main>
      </div>
    </>
  );
}

export default MainLayout;
