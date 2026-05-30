export function AttachmentIcon() {
  return (
    <svg
      className="h-5 w-5"
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

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`h-11 rounded-xl bg-black px-4 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#111111] transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      className={`h-11 rounded-xl px-4 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}