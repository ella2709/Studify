import { useParams, useLocation, Link } from "react-router-dom";
import messages from "../messages";

function titleFromId(projectId) {
  return projectId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function ProjectPage() {
  const { projectId } = useParams();
  const location = useLocation();

  const projectName = location.state?.projectName || titleFromId(projectId);

  const tools = [
    {
      to: `/project/${projectId}/upload`,
      icon: "📎",
      label: "Upload Materials",
      description: "Upload study files - txt, md, csv, json, pdf and more.",
    },
    {
      to: `/project/${projectId}/questions`,
      icon: "💬",
      label: "Ask AI",
      description: "Ask questions about your uploaded materials and get AI-powered answers.",
    },
    {
      to: `/project/${projectId}/summarize`,
      icon: "📝",
      label: "Summaries",
      description: "Generate focused topic summaries from your study materials.",
    },
    {
      to: `/project/${projectId}/exam`,
      icon: "🧪",
      label: "Exam Simulator",
      description: "Generate, solve and review interactive exams from your materials.",
    },
  ];

  return (
    <div
      className="app-page app-page--full fade-in"
      style={{
        width: "100%",
        maxWidth: "1200px",
      }}
      >
      <div
        className="page-head"
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Link to="/" className="breadcrumb" style={{ marginBottom: "0.9rem" }}>
          <ChevronLeft /> {messages.projects.allProjects}
        </Link>

        <p className="page-eyebrow">{messages.pageTitles.project}</p>

       <h1
        style={{
          fontSize: "1.8rem",
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.3,
          color: "var(--text)",
        }}
      >
        {projectName}
      </h1>

        <p className="page-subtitle">
         {messages.upload.chooseTool}
        </p>
    </div>

      <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(340px, 1fr))",
            gap: "1.5rem",
            maxWidth: "820px",
            margin: "2rem auto 0",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
        {tools.map((tool) => (
          <ToolCard key={tool.to} {...tool} projectName={projectName} />
        ))}
      </div>
    </div>
  );
}

function ToolCard({ to, icon, label, description, projectName }) {
  return (
    <Link to={to} state={{ projectName }} className="card card-interactive" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", gap: "0.9rem", textDecoration: "none", color: "var(--text)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--r-md)",
            background: "var(--accent-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
          }}
        >
          {icon}
        </div>
        <ArrowIcon />
      </div>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.35rem" }}>{label}</div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.55 }}>{description}</div>
      </div>
    </Link>
  );
}

function ChevronLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default ProjectPage;
