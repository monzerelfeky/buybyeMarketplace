import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function ContactUs() {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }
      setSubmitted(true);
      setSubmitSuccess("Message sent. We'll reply soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setSubmitError(err.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Contact Us</h1>
          <div className="page-content">
            <p>
              We're here to help! Reach out to us through any of the following channels.
            </p>

            <div className="contact-grid">
              <div className="contact-card">
                <h3>Email</h3>
                <p>support@buybye.eg</p>
                <p className="contact-small">Response within 24 hours</p>
              </div>
              <div className="contact-card">
                <h3>Phone</h3>
                <p>+20 2 1234 5678</p>
                <p className="contact-small">Sun-Thu, 9AM-6PM</p>
              </div>
              <div className="contact-card">
                <h3>Live Chat</h3>
                <p>Available on website</p>
                <p className="contact-small">Instant support</p>
              </div>
              <div className="contact-card">
                <h3>Office</h3>
                <p>Cairo, Egypt</p>
                <p className="contact-small">Visit by appointment</p>
              </div>
            </div>

            <div
              style={{
                marginTop: "48px",
                paddingTop: "48px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <h2>Send us a message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your Name *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Subject *"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
                <textarea
                  placeholder="Your Message *"
                  rows="6"
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                ></textarea>
                {submitError ? <p className="form-error">{submitError}</p> : null}
                {submitSuccess ? (
                  <p className="form-success">{submitSuccess}</p>
                ) : null}
                <button type="submit" className="submit-btn">
                  {submitted ? "Sent!" : isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
