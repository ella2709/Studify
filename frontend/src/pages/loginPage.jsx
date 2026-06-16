import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../authentication/firebaseAuth";
import { useNavigate, Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import messages from "../messages.js";
import { getAuthErrorMessage } from "../authentication/authErrors.js";

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
    setSuccess("Password reset email sent");
  } catch (err) {
    setSuccess("");
    setError(getAuthErrorMessage("auth/fail-to-send-reset-email"));
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="w-full max-w-md bg-[var(--bg-surface)] p-8 rounded-3xl shadow-lg border border-[var(--border)]">
       <div className="flex justify-center mb-4">
          <img
            src="/Logo.png"
            alt="Studify"
            className="w-30 h-30"
          />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {messages.registerAndLogin.login}
        </h1>

        

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
            <p className="text-center text-red-500 text-sm mt-1">
              {error}
            </p>
          )}

          <div className="text-sm">
            <span className="text-[var(--text-muted)]">
              {messages.registerAndLogin.forgotPassword}
            </span>

          <button
                type="button"
                onClick={handleResetPassword}
                className="cursor-pointer text-sm underline text-[var(--accent)] hover:underline self-end"
              >
                {messages.registerAndLogin.resetPassword}
          </button>
      </div>

        
          <button
            type="submit"
            className="btn btn-accent w-full"
          >
            {messages.registerAndLogin.signIn}
          </button>
        </form>

       <div className="mt-6 text-center text-sm">
        <span className="text-[var(--text-muted)]">
          {messages.registerAndLogin.newHere}{" "}
        </span>

        <Link
          to="/register"
          className="text-[var(--accent)] underline hover:opacity-80"
        >
         {messages.registerAndLogin.createAccount}
        </Link>
      </div>
      </div>
    </div>
  );
}