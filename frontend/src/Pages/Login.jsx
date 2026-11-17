import { useState } from "react";
import "./Login.css";

function Login({ onBackHome, onSignUp, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid email or password.");
        return;
      }

      if (!data.user) {
        setMessage("Login response is missing user details.");
        return;
      }

      sessionStorage.setItem(
        "medimatrixUser",
        JSON.stringify(data.user)
      );

      if (typeof onLoginSuccess !== "function") {
        console.error("onLoginSuccess callback is missing.");
        setMessage(
          "Login worked, but dashboard navigation is not connected. Please check App.jsx."
        );
        return;
      }

      console.log("Login successful:", data.user);
      setIsSuccess(true);
      setMessage("Login successful! Opening dashboard...");

      onLoginSuccess(data.user);
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Cannot connect to the backend. Please check the server."
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
          onClick={onBackHome}
        >
          ← Back to Home
        </button>

        <div className="auth-brand">
          <div className="auth-logo">✚</div>
          <div>
            <h1>MediMatrix AI</h1>
            <p>INTELLIGENT HEALTHCARE</p>
          </div>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h2>Login to your account</h2>
          <p>Your personal healthcare space is waiting for you.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {message && (
            <p
              className={isSuccess ? "auth-success" : "auth-error"}
              role="status"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login to MediMatrix AI →"}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{" "}
          <button type="button" onClick={onSignUp}>
            Create an account
          </button>
        </div>

        <div className="auth-footer">
          Your health data deserves care and privacy.
        </div>
      </div>
    </main>
  );
}

export default Login;