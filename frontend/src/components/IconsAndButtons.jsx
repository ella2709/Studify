/* ── Attachment icon ─────────────────────────────────────── */
export function AttachmentIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.2a2 2 0 1 1-2.82-2.83l8.49-8.48" />
    </svg>
  );
}

/* ── Hamburger icon (never shows X) ─────────────────────── */
// When sidebar is open: top and bottom bars shrink inward (staircase effect).
// When sidebar is closed: all three bars are full-width.
// This gives a clear visual cue without an X.
export function HamburgerIcon({ open }) {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <rect
        y="0"
        width="20"
        height="2"
        rx="1"
        fill="currentColor"
        style={{
          transform: open ? "scaleX(0.7)" : "scaleX(1)",
          transformOrigin: "0% 50%",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      <rect y="7" width="20" height="2" rx="1" fill="currentColor" />
      <rect
        y="14"
        width="20"
        height="2"
        rx="1"
        fill="currentColor"
        style={{
          transform: open ? "scaleX(0.5)" : "scaleX(1)",
          transformOrigin: "0% 50%",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </svg>
  );
}

/* ── Home icon ───────────────────────────────────────────── */
export function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/* ── Plus icon ───────────────────────────────────────────── */
export function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ flexShrink: 0 }}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ── Search icon ─────────────────────────────────────────── */
export function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-muted)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ── Button components ───────────────────────────────────── */
export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button className={`btn btn-primary ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button className={`btn btn-secondary ${className}`} {...props}>
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button className={`btn btn-ghost ${className}`} {...props}>
      {children}
    </button>
  );
}
