import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ReportSeller.css";

export default function ReportSeller() {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason || details.trim() === "") {
      alert("Please fill all required fields.");
      return;
    }

    console.log({
      reason,
      details,
      evidence,
    });

    alert("Your report has been submitted. Thank you.");
    setReason("");
    setDetails("");
    setEvidence(null);
  };

  return (
    <>
      <Header />

      <div className="report-seller-container">
        <h1>Report Seller</h1>
        <p className="subtitle">
          If you believe this seller violated policies, please submit a report.
        </p>

        <form className="report-form" onSubmit={handleSubmit}>

          {/* Reason */}
          <label>Reason for Report <span>*</span></label>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">-- Select a reason --</option>
            <option value="fake_products">Selling fake products</option>
            <option value="abusive_behavior">Abusive behavior</option>
            <option value="spam">Spam or misleading info</option>
            <option value="fraud">Fraud / Scam attempt</option>
            <option value="other">Other</option>
          </select>

          {/* Details */}
          <label>Explain the issue <span>*</span></label>
          <textarea
            placeholder="Describe the problem in detail..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          {/* Evidence */}
          <label>Upload evidence (optional)</label>
          <input
            type="file"
            onChange={(e) => setEvidence(e.target.files[0])}
          />

          <button type="submit" className="submit-btn-report">
            Submit Report
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
}
