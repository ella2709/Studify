import { createPortal } from "react-dom";

function ConfirmDialog({
  open,
  title,
  message,
  children = null,

  confirmText = "Delete",
  cancelText = "Cancel",
  loadingText = "Deleting...",

  onConfirm,
  onCancel,

  loading = false,

  showCancel = true,
  closeOnOverlay = true,

  confirmVariant = "danger",
  maxWidth = 420,
}) {
  if (!open) return null;

  function handleOverlayMouseDown() {
    if (
      loading ||
      !closeOnOverlay ||
      typeof onCancel !== "function"
    ) {
      return;
    }

    onCancel();
  }

  const confirmButtonClass =
    confirmVariant === "primary"
      ? "btn btn-primary"
      : confirmVariant === "secondary"
        ? "btn btn-secondary"
        : "btn btn-danger";

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        style={{ maxWidth }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3
          id="confirm-dialog-title"
          className="modal-title"
          style={{ fontSize: "1.15rem" }}
        >
          {title}
        </h3>

        {message && (
          <p
            className="modal-text"
            style={{
              whiteSpace: "pre-line",
              lineHeight: 1.65,
            }}
          >
            {message}
          </p>
        )}

        {children}

        <div className="modal-actions">
          {showCancel && cancelText && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className={confirmButtonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;