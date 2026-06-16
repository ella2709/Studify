import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import messages from "../messages.js";
import { auth } from "../authentication/firebaseAuth";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { getAuthErrorMessage } from "../authentication/authErrors.js";

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      navigate("/");
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4 py-6">
      <div className="w-full max-w-md bg-[var(--bg-surface)] px-8 py-6 rounded-3xl shadow-lg border border-[var(--border)]">
        <div className="flex justify-center mb-5">
          <img
            src="/Logo.png"
            alt="Studify"
            className="w-28 h-28 object-contain"
          />
        </div>

         <h1 className="text-2xl font-bold text-center mb-6">
          {messages.registerAndLogin.signup}
        </h1>

        <form onSubmit={handleRegister} className="space-y-3">
          <input
            className="input-base"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input-base"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              className="input-base pr-12"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {showPassword  ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
            </button>
          </div>

          <div className="relative">
            <input
              className="input-base pr-12"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

           <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              {showConfirmPassword ? (
                <FiEyeOff size={20} />
              ) : (
                <FiEye size={20} />
              )}
          </button>
          </div>

          {error && (
            <p className="text-center text-red-500 text-sm mt-1">
              {error}
            </p>
          )}
          <button type="submit" className=" mt-6 btn btn-accent w-full">
            {messages.registerAndLogin.createAccount}
          </button>
        </form>
      </div>
    </div>
  );
}