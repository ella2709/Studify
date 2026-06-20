import { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

function ProjectPage() {
  const { projectId } = useParams();
  const location = useLocation();

  const projectName =
    location.state?.projectName ||
    projectId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const tools = [
    {
      to: `/project/${projectId}/upload`,
      icon: "📎",
      label: "Upload Materials",
      description: "Upload study files — txt, md, csv, json, pdf and more.",
      color: "#F5EDE2",
    },
    {
      to: `/project/${projectId}/questions`,
      icon: "💬",
      label: "Ask AI",
      description: "Ask questions about your uploaded materials and get AI-powered answers.",
      color: "#EDF2FB",
    },
    {
      to: `/project/${projectId}/summarize`,
      icon: "📝",
      label: "Summaries",
      description: "Generate focused topic summaries from your study materials.",
      color: "#F0FBF0",
    },
    {
      to: `/project/${projectId}/exam`,
      icon: "🧪",
      label: "Exam Simulator",
      description: "Generate, solve and review interactive exams from your materials.",
      color: "#FFF7ED",
    },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.75rem" }}>
        <Link
          to="/"
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            transition: "color 0.14s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All projects
        </Link>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "1.875rem",
          fontWeight: 800,
          color: "var(--text)",
          margin: "0 0 0.5rem",
          lineHeight: 1.2,
        }}
      >
        {projectName}
      </h1>
      <p
        style={{
          fontSize: "0.9375rem",
          color: "var(--text-2)",
          margin: "0 0 2.25rem",
        }}
      >
        Choose a tool to work with your study materials.
      </p>

      {/* Tool cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.125rem",
        }}
      >
        {tools.map((tool) => (
          <ToolCard
            key={tool.to}
            to={tool.to}
            icon={tool.icon}
            label={tool.label}
            description={tool.description}
            state={{ projectName }}
          />
        ))}
      </div>
    </div>
  );
}

function ToolCard({ to, icon, label, description, state }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      state={state}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        backgroundColor: "var(--bg-surface)",
        border: `1.5px solid ${hovered ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "1rem",
        padding: "1.5rem",
        textDecoration: "none",
        color: "var(--text)",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-card)",
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{icon}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.18s" }}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
      <div>
        <div
          style={{
            fontSize: "1.0625rem",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "0.3125rem",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-2)",
            lineHeight: 1.55,
          }}
        >
          {description}
        </div>
      </div>
    </Link>
  );
}

export default ProjectPage;
