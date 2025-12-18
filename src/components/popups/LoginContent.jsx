// src/components/popups/LoginContent.jsx
import React, { useState } from "react";
import "../../styles/Login.css";

export default function LoginContent({ onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
  });

  const validate = () => {
    let newErrors = { email: "", password: "", name: "" };
    let valid = true;

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      valid = false;
    }

    // Password
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    // Name for sign-up
    if (isSignUp) {
      if (!formData.name.trim()) {
        newErrors.name = "Full name is required.";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!formData.email || !formData.password) {
      setServerError("Please fill in all required fields");
      return;
    }

    if (isSignUp && !formData.name) {
      setServerError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const payload = isSignUp 
        ? { name: formData.name, email: formData.email, password: formData.password, isSeller: false }
        : { email: formData.email, password: formData.password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Authentication failed');
        setIsLoading(false);
        return;
      }

      // Store token and user info in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedEmail', formData.email);
        }
      }

      // Close modal
      onClose?.();
    } catch (err) {
      console.error('Auth error:', err);
      setServerError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });

    // Live validation
    let message = "";

    if (name === "email") {
      if (!value.trim()) message = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(value))
        message = "Please enter a valid email.";
    }

    if (name === "password") {
      if (!value.trim()) message = "Password is required.";
      else if (value.length < 6)
        message = "Password must be at least 6 characters.";
    }

    if (name === "name" && isSignUp) {
      if (!value.trim()) message = "Full name is required.";
      else if (value.length < 3)
        message = "Name must be at least 3 characters.";
    }

    setErrors({ ...errors, [name]: message });
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} login coming soon!`);
  };

  return (
    <div className="modal-inner-content">
      <div className="modal-header">
        <h2 className="modal-title">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="modal-subtitle">
          {isSignUp
            ? "Sign up to start buying and selling"
            : "Login to continue to BuyBye"}
        </p>
      </div>

      {/* FORM */}
      <form
        className="modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* FULL NAME */}
        {isSignUp && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="form-input"
              placeholder="Enter your name"
            />
            {errors.name && <p className="input-error">{errors.name}</p>}
          </div>
        )}

        {/* EMAIL */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrapper">
            <svg
              className="input-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="5" width="18" height="14" rx="2"></rect>
              <path d="M3 7l9 6 9-6"></path>
            </svg>

            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="form-input with-left-icon"
              placeholder="Enter your email"
            />
          </div>
          {errors.email && <p className="input-error">{errors.email}</p>}
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <svg
              className="input-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="5" y="11" width="14" height="10" rx="2"></rect>
              <path d="M12 17v-2"></path>
              <circle cx="12" cy="8" r="3"></circle>
              <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
            </svg>

            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="form-input with-left-icon with-right-icon"
              placeholder="Enter your password"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="input-error">{errors.password}</p>}
        </div>

        {serverError && <p className="form-error" style={{ marginBottom: '16px', color: '#d32f2f', fontSize: '14px' }}>{serverError}</p>}

        {!isSignUp && (
          <div className="remember-forgot-row">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" className="forgot-link">
              Forgot password?
            </a>
          </div>
        )}

        <button className="submit-btn" type="submit" disabled={isLoading}>
          {isLoading ? (isSignUp ? "Signing Up..." : "Logging In...") : (isSignUp ? "Sign Up" : "Login")}
        </button>
      </form>

      <div className="toggle-auth-mode">
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="toggle-btn"
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>

      <div className="divider-container">
        <div className="divider-line"></div>
        <div className="divider-text">
          <span>Or continue with</span>
        </div>
      </div>

      <div className="social-buttons">
        <button
          type="button"
          className="social-btn"
          onClick={() => handleSocialLogin("Google")}
        >
          <svg className="social-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <button
          type="button"
          className="social-btn"
          onClick={() => handleSocialLogin("Facebook")}
        >
          <svg className="social-icon" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>
    </div>
  );
}
