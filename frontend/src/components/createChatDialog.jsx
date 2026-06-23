import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function CreateChatDialog({
  open,
  chatType = "summary",
  onCancel,
  onCreate,
}) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) setTitle("");
  }, [open]);

  if (!open) return null;

  const description =
    chatType === "summary"
      ? "Give your summary chat a title."
      : "Give your question chat a title.";

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate(title.trim());
  };

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h2 style={styles.title}>Create new chat</h2>

        <p style={styles.description}>{description}</p>

        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chat title..."
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />

        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>

          <button style={styles.createButton} onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 9999,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  dialog: {
    width: "min(520px, calc(100vw - 2rem))",
    backgroundColor: "#fff",
    borderRadius: "1.25rem",
    padding: "1.75rem",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.22)",
  },

  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#151515",
  },

  description: {
    margin: "0.65rem 0 1.25rem",
    fontSize: "1rem",
    color: "#5f5a52",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    height: "3.3rem",
    borderRadius: "0.85rem",
    border: "1.5px solid #d2ad78",
    padding: "0 1rem",
    fontSize: "1rem",
    outline: "none",
    color: "#1f1f1f",
    boxShadow: "0 0 0 4px rgba(210, 173, 120, 0.16)",
  },

  actions: {
    marginTop: "1.4rem",
    display: "flex",
    justifyContent: "flex-start",
    gap: "0.75rem",
  },

  cancelButton: {
    minWidth: "100px",
    height: "42px",
    borderRadius: "0.75rem",
    border: "1px solid #d9cdbd",
    backgroundColor: "#fff",
    color: "#1f1f1f",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
  },

  createButton: {
    minWidth: "100px",
    height: "42px",
    borderRadius: "0.75rem",
    border: "none",
    backgroundColor: "#d2ad78",
    color: "#1f1f1f",
    fontSize: "0.95rem",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(100, 70, 30, 0.15)",
  },
};