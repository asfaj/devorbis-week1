import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "qwerty",
  "admin",
  "welcome",
  "letmein",
];

const validateEmail = (email) => {
  if (!EMAIL_FORMAT.test(email)) {
    return "Enter a valid email address, e.g. name@example.com";
  }

  return "";
};

const getPasswordError = (password, username, email) => {
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 72) return "Use no more than 72 characters.";
  if (!/[A-Z]/.test(password)) return "Add an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Add a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Add a number.";
  if (!/[!@#$%&*]/.test(password)) return "Add a symbol: ! @ # $ % & *.";

  const personalInfo = [username, email.split("@")[0]]
    .filter((value) => value.length >= 3)
    .map((value) => value.toLowerCase());
  if (
    personalInfo.some((value) => password.toLowerCase().includes(value))
  ) {
    return "Do not use your username or email.";
  }

  const normalized = password
    .toLowerCase()
    .replace(/[4@]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9]/g, "");

  if (
    COMMON_PASSWORDS.some(
      (commonPassword) =>
        normalized.includes(commonPassword) ||
        password.toLowerCase().includes(commonPassword),
    )
  ) {
    return "Avoid common words and weak patterns.";
  }

  return "";
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    const cleanedEmail = email.trim().toLowerCase();
    const emailValidationError = validateEmail(cleanedEmail);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setError(emailValidationError);
      return;
    }

    const passwordError = getPasswordError(password, username, cleanedEmail);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    try {
      await register(username, cleanedEmail, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M7 3.75h8.25L19 7.5v12.75H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" />
            <path d="M15 3.75V8h4M8.5 12h7M8.5 15.5h5" />
          </svg>
        </div>
        <p className="brand-name">TaskTrack</p>
        <h1 id="register-title">Create your account</h1>
        <p className="auth-subtitle">
          Create an account to manage your tasks and stay organized.
        </p>

        {error && (
          <p className="error auth-error" role="alert">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="register-username">Username</label>
            <div className="input-wrapper">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.25" />
                <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
              </svg>
              <input
                id="register-username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="register-email">Email address</label>
            <div className="input-wrapper">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6.5h16v11H4zM4 7l8 6 8-6" />
              </svg>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                autoComplete="email"
                required
              />
            </div>
            {emailError && (
              <p className="error" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="register-password">Password</label>
            <div className="input-wrapper">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
              </svg>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="password-hint">
              Use 8+ characters with uppercase, lowercase, a number, and a
              special character.
            </p>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}