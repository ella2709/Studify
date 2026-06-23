export default function AuthShell({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background:
          "radial-gradient(circle at 15% 10%, var(--accent-bg) 0, transparent 38%)," +
          "radial-gradient(circle at 88% 85%, var(--accent-bg) 0, transparent 36%)," +
          "var(--bg-app)",
      }}
    >
      <div className="card fade-in" style={{ width: "100%", maxWidth: 420, padding: "2.25rem 2rem", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
          <img
            src="/Logo.png"
            alt="Studify"
            style={{ width: 76, height: 76, objectFit: "contain", borderRadius: "var(--r-lg)", background: "#fff", padding: 8, boxShadow: "var(--shadow-sm)" }}
          />
          <h1 style={{ fontSize: "1.55rem", fontWeight: 800, margin: "1rem 0 0.3rem" }}>{title}</h1>
          {subtitle && <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0, textAlign: "center" }}>{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
