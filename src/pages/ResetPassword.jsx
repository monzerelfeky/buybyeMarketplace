// src/pages/ResetPassword.jsx
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ResetPassword.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    confirm: "",
  });
  const [tokenError, setTokenError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [status, setStatus] = useState("idle");

  const token = params.get("token") || "";

  useEffect(() => {
    const validateToken = async () => {
      if (!email || !token) {
        setTokenError("Invalid or expired reset link.");
        return;
      }

      try {
        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
        const res = await fetch(
          `${API_BASE}/api/auth/validate-reset-token?email=${encodeURIComponent(
            email
          )}&token=${encodeURIComponent(token)}`
        );
        if (!res.ok) {
          setTokenError("Invalid or expired reset link.");
        }
      } catch (err) {
        console.error("Validate reset token error:", err);
        setTokenError("Unable to validate reset link.");
      }
    };

    validateToken();
  }, [email, token]);

  const validateFields = (values, isSubmit = false) => {
    const nextErrors = { email: "", password: "", confirm: "" };

    if (isSubmit && !values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (values.email && !/\S+@\S+\.\S+/.test(values.email)) {
      nextErrors.email = "Please enter a valid email.";
    }

    if (isSubmit && !values.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (values.password && values.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (values.confirm && values.password !== values.confirm) {
      nextErrors.confirm = "Passwords do not match.";
    } else if (isSubmit && !values.confirm.trim()) {
      nextErrors.confirm = "Please confirm your password.";
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateFields({ email, password, confirm }, true);
    setFieldErrors(nextErrors);
    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors || tokenError) {
      return;
    }

    setGeneralError("");
    setStatus("loading");
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch (err) {
      console.error("Reset password error:", err);
      setStatus("idle");
      setGeneralError("Failed to reset password. Please try again.");
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    setFieldErrors((prev) =>
      validateFields({ email: value, password, confirm }, false)
    );
    if (generalError) setGeneralError("");
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setFieldErrors((prev) =>
      validateFields({ email, password: value, confirm }, false)
    );
    if (generalError) setGeneralError("");
  };

  const handleConfirmChange = (value) => {
    setConfirm(value);
    setFieldErrors((prev) =>
      validateFields({ email, password, confirm: value }, false)
    );
    if (generalError) setGeneralError("");
  };

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  return (
    <div className="homepage-container">
      <Header />
      <div className="header-spacer" />

      <section className="reset-section">
        <div className="reset-card">
          <div className="reset-header">
            <h1 className="reset-title">Reset your password</h1>
            <p className="reset-subtitle">
              Choose a new password for your account.
            </p>
          </div>

          <form className="reset-form" onSubmit={handleSubmit}>
            <label className="reset-label" htmlFor="reset-email">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              className={`reset-input ${fieldErrors.email ? "is-error" : ""}`}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="you@example.com"
            />
            {fieldErrors.email ? (
              <p className="reset-error">{fieldErrors.email}</p>
            ) : null}

            <label className="reset-label" htmlFor="reset-password">
              New Password
            </label>
            <input
              id="reset-password"
              type="password"
              className={`reset-input ${fieldErrors.password ? "is-error" : ""}`}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter a new password"
            />
            {fieldErrors.password ? (
              <p className="reset-error">{fieldErrors.password}</p>
            ) : null}

            <label className="reset-label" htmlFor="reset-confirm">
              Confirm Password
            </label>
            <input
              id="reset-confirm"
              type="password"
              className={`reset-input ${fieldErrors.confirm ? "is-error" : ""}`}
              value={confirm}
              onChange={(e) => handleConfirmChange(e.target.value)}
              placeholder="Confirm your password"
            />
            {fieldErrors.confirm ? (
              <p className="reset-error">{fieldErrors.confirm}</p>
            ) : null}

            {tokenError ? <p className="reset-error">{tokenError}</p> : null}
            {generalError ? <p className="reset-error">{generalError}</p> : null}

            <button
              type="submit"
              className="reset-submit"
              disabled={status === "loading" || hasFieldErrors || !!tokenError}
            >
              {status === "loading" ? "Resetting..." : "Reset password"}
            </button>
          </form>

          {status === "sent" ? (
            <div className="reset-success">
              Your password was reset. You can now log in with your new password.
            </div>
          ) : null}

          <div className="reset-footer">
            <Link to="/" className="reset-back">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
