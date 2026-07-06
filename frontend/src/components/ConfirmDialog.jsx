import { createPortal } from "react-dom";

function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onMouseDown={loading ? undefined : onCancel}>
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="modal-title" style={{ fontSize: "1.15rem" }}>
          {title}
        </h3>

        <p className="modal-text">{message}</p>

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;