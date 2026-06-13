import { useState } from "react";
import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../authentication/firebaseAuth";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/");

    } catch(err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">

      <div className="w-full max-w-md bg-[var(--bg-surface)] p-8 rounded-3xl shadow-lg border border-[var(--border)]">

        <h1 className="text-3xl font-semibold text-center mb-2">
          Create Account
        </h1>

        <form
          onSubmit={handleRegister}
          className="space-y-4 mt-6"
        >

          <input
            className="input-base"
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
            className="btn btn-accent w-full"
          >
            Create Account
          </button>

        </form>

      </div>

    </div>
  );
}