// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setError("");
    setStatus("loading");
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch (err) {
      console.error("Forgot password error:", err);
      setStatus("idle");
      setError("Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="homepage-container">
      <Header />
      <div className="header-spacer" />

      <section className="forgot-section">
        <div className="forgot-card">
          <div className="forgot-header">
            <h1 className="forgot-title">Forgot your password?</h1>
            <p className="forgot-subtitle">
              Enter your email and we will send you a reset link.
            </p>
          </div>

          <form className="forgot-form" onSubmit={handleSubmit}>
            <label className="forgot-label" htmlFor="forgot-email">
              Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              className={`forgot-input ${error ? "is-error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {error ? <p className="forgot-error">{error}</p> : null}

            <button
              type="submit"
              className="forgot-submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending..." : "Send reset link"}
            </button>
          </form>

          {status === "sent" ? (
            <div className="forgot-success">
              If an account exists for {email}, you will receive a reset link
              shortly.
            </div>
          ) : null}

          <div className="forgot-footer">
            <Link to="/" className="forgot-back">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
