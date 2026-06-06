import { useEffect, useState } from "react";
import { TopBar, Sidebar } from "./sideBar";
import { useRecentChatsByProject } from "../services/conversationService";

const SIDEBAR_W = 264;

export function MainLayout({ children, projects, projectsLoading, isDark, onToggleDark, onCreateProject }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= 768
  );

  const recentChatsByProject = useRecentChatsByProject(projects || []);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const closeSidebarOnMobile = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <>
      {isSidebarOpen && isMobile && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 19,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: isSidebarOpen ? 0 : -SIDEBAR_W,
          width: SIDEBAR_W,
          height: "100vh",
          backgroundColor: "var(--sidebar-bg)",
          zIndex: 20,
        }}
      >
       <Sidebar
            projects={projects}
            projectsLoading={projectsLoading}
            recentChatsByProject={recentChatsByProject}
            isDark={isDark}
            onToggleDark={onToggleDark}
            onCreateProject={onCreateProject}
            onNavClick={closeSidebarOnMobile}
            />
      </aside>

      <div
        style={{
          paddingLeft: isSidebarOpen && !isMobile ? SIDEBAR_W : 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
        />

        <main style={{ flex: 1, padding: "2rem 2.5rem 3rem" }}>
          {children}
        </main>
      </div>
    </>
  );
}

export default MainLayout;