import { useState } from "react";
import "./Signup.css";

function Signup({ onBackLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Patient");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            role,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Account creation failed.");
        return;
      }

      setIsSuccess(true);
      setMessage(
        `${data.message} Your selected role is ${role}.`
      );

      setName("");
      setEmail("");
      setRole("Patient");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <button
          type="button"
          className="auth-back"
          onClick={onBackLogin}
        >
          ← Back to Login
        </button>

        <div className="auth-brand">
          <div className="auth-logo">✚</div>
          <div>
            <h1>MediMatrix AI</h1>
            <p>INTELLIGENT HEALTHCARE</p>
          </div>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">JOIN MEDIMATRIX</span>
          <h2>Create your account</h2>
          <p>
            Start organizing your personal healthcare in one place.
          </p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="auth-field">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-role">Account type</label>
            <select
              id="signup-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              required
            >
              <option value="Patient">Patient</option>
             </select> 
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {message && (
            <p
              role="status"
              style={{
                color: isSuccess ? "#16a34a" : "#dc2626",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={onBackLogin}>
            Login
          </button>
        </div>

        <div className="auth-footer">
          Your health data deserves care and privacy.
        </div>
      </div>
    </main>
  );
}

export default Signup;