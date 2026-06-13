import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../authentication/firebaseAuth";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="w-full max-w-md bg-[var(--bg-surface)] p-8 rounded-3xl shadow-lg border border-[var(--border)]">
        <h1 className="text-3xl font-semibold text-center mb-2">
          Studify
        </h1>

        <p className="text-center text-[var(--text-muted)] mb-8">
          Sign in to continue
        </p>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            className="input-base"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            className="input-base"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {error && (
            <div className="status-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-accent w-full"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-[var(--accent)]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}