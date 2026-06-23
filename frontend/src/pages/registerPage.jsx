import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import messages from "../messages.js";
import { auth } from "../authentication/firebaseAuth";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { getAuthErrorMessage } from "../authentication/authErrors.js";
import AuthShell from "../components/authShell.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(messages.authErrors.missingName);
      return;
    }
    if (password !== confirmPassword) {
      setError(messages.authErrors.passwordsDoNotMatch);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate("/");
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    }
  };

  return (
    <AuthShell title={messages.registerAndLogin.signup} subtitle="Create your account to start studying smarter.">
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <div className="field">
          <label className="field-label">Name</label>
          <input className="input-base" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">Email</label>
          <input className="input-base" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">Password</label>
          <PasswordInput value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((p) => !p)} placeholder="••••••••" />
        </div>

        <div className="field">
          <label className="field-label">Confirm password</label>
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} show={showConfirmPassword} onToggle={() => setShowConfirmPassword((p) => !p)} placeholder="••••••••" />
        </div>

        {error && <div className="status-error">{error}</div>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: "0.35rem" }}>
          {messages.registerAndLogin.createAccount}
        </button>
      </form>

      <p style={{ marginTop: "1.4rem", textAlign: "center", fontSize: "0.88rem", color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--accent-dark)", fontWeight: 600, textDecoration: "none" }}>
          {messages.registerAndLogin.signIn}
        </Link>
      </p>
    </AuthShell>
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <input
        className="input-base"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingRight: "2.75rem" }}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "flex",
        }}
      >
        {show ? <FiEyeOff size={19} /> : <FiEye size={19} />}
      </button>
    </div>
  );
}
