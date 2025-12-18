import React from "react";
import "../../styles/BecomeSeller.css";

export default function BecomeSellerContent({ onConfirm }) {
  return (
    <>
      {/* Header */}
      <div className="bs-header">
        <h2 className="bs-title">Become a Seller</h2>
        <p className="bs-subtitle">Start selling on BuyBye and reach thousands of buyers</p>
      </div>

      {/* Benefits List */}
      <div className="bs-benefits">
        <div className="bs-benefit-item">
          <span className="bs-check">✓</span>
          <span>Post unlimited ads across all categories</span>
        </div>
        <div className="bs-benefit-item">
          <span className="bs-check">✓</span>
          <span>Manage your listings from seller dashboard</span>
        </div>
        <div className="bs-benefit-item">
          <span className="bs-check">✓</span>
          <span>Track orders and communicate with buyers</span>
        </div>
        <div className="bs-benefit-item">
          <span className="bs-check">✓</span>
          <span>Keep shopping while you sell - same account</span>
        </div>
      </div>

      {/* Action Button */}
      <button className="bs-btn-activate" onClick={onConfirm}>
        Activate Seller Account
      </button>

      <p className="bs-note">
        You can switch between buyer and seller modes anytime
      </p>
    </>
  );
}