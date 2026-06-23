import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../authentication/firebaseAuth";
import { useNavigate, Link } from "react-router-dom";
import messages from "../messages.js";
import { getAuthErrorMessage } from "../authentication/authErrors.js";
import AuthShell from "../components/authShell.jsx";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError(getAuthErrorMessage("auth/invalid-email"));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError("");
      setSuccess("Password reset email sent. Check your inbox.");
    } catch {
      setSuccess("");
      setError(getAuthErrorMessage("auth/fail-to-send-reset-email"));
    }
  };

  return (
    <AuthShell title={messages.registerAndLogin.login} subtitle="Welcome back — sign in to continue.">
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div className="field">
          <label className="field-label">Email</label>
          <input className="input-base" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label className="field-label">Password</label>
            <button type="button" onClick={handleResetPassword} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "var(--accent-dark)", fontWeight: 600, padding: 0 }}>
              {messages.registerAndLogin.forgotPassword}
              {messages.registerAndLogin.resetPassword}
            </button>
          </div>
          <input className="input-base" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <div className="status-error">{error}</div>}
        {success && <div className="status-success">{success}</div>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: "0.35rem" }}>
          {messages.registerAndLogin.signIn}
        </button>
      </form>

      <p style={{ marginTop: "1.4rem", textAlign: "center", fontSize: "0.88rem", color: "var(--text-muted)" }}>
        {messages.registerAndLogin.newHere}{" "}
        <Link to="/register" style={{ color: "var(--accent-dark)", fontWeight: 600, textDecoration: "none" }}>
          {messages.registerAndLogin.createAccount}
        </Link>
      </p>
    </AuthShell>
  );
}
