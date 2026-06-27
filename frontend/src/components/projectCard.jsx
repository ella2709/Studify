import { Link } from "react-router-dom";
import { TrashIcon } from "./IconsAndButtons";
import { safeFormatDate } from "../helpers/dateHelper";

export function ProjectCard({ project, onDeleteClick }) {
  const name = project.name || "Untitled";
  const filesCount = project.filesCount ?? project.files;
  const chatsCount = project.chatsCount ?? project.chats;
  const updatedAt = safeFormatDate(project.updatedAt ?? project.updated);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteClick?.(project);
  };

  return (
    <Link
      to={`/project/${project.id}`}
      state={{ projectName: name }}
      className="project-card"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="project-card__icon">📚</div>

        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label="Delete project"
          title="Delete project"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "0.25rem",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrashIcon />
        </button>
      </div>

      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={name}
      >
        {name}
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem",
          marginTop: "auto",
        }}
      >
        {filesCount !== undefined && (
          <span className="meta-pill">📎 {filesCount} files</span>
        )}

        {chatsCount !== undefined && (
          <span className="meta-pill">💬 {chatsCount} chats</span>
        )}

        {updatedAt && <span className="meta-pill">🕑 {updatedAt}</span>}
      </div>
    </Link>
  );
}