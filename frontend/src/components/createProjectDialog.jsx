import { createPortal } from "react-dom";

export function CreateProjectDialog({
  open,
  name,
  onNameChange,
  onSubmit,
  onClose,
  creating,
  error,
}) {
  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!creating) {
      onSubmit?.();
    }
  };

  return createPortal(
    <div className="modal-overlay" onMouseDown={onClose}>
      <form
        className="modal"
        style={{ maxWidth: 520 }}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.1rem",
          }}
        >
          <div>
            <h2 className="modal-title">Create new project</h2>

            <p className="modal-text" style={{ margin: "0.3rem 0 0" }}>
              Give your study project a clear name.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="modal-close"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="field">
          <label className="field-label">Project name</label>

          <input
            value={name}
            onChange={(e) => onNameChange?.(e.target.value)}
            autoFocus
            placeholder="For example: Operating Systems"
            disabled={creating}
            className="input-base"
          />
        </div>

        {error && (
          <p className="status-error" style={{ marginTop: "0.75rem" }}>
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="btn btn-secondary"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={creating || !String(name || "").trim()}
            className="btn btn-primary"
          >
            {creating ? "Creating..." : "Create project"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}