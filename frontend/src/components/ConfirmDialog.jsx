function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          boxShadow: "var(--shadow-card)",
          padding: "1.25rem",
        }}
      >
        <h3 style={{ margin: "0 0 0.5rem", color: "var(--text)" }}>
          {title}
        </h3>

        <p style={{ margin: "0 0 1.25rem", color: "var(--text-2)", lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.7rem 1rem",
              backgroundColor: "#991b1b",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;