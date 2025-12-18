import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function HelpCenter() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Help Center</h1>
          <div className="page-content">
            <p>
              Find answers to common questions and learn how to make the most of BuyBye.
            </p>
            
            <div className="steps-grid">
              <div className="step-card">
                <h3>🛍️ Buying Guide</h3>
                <p>Learn how to find and purchase items safely</p>
                <ul style={{ textAlign: 'left', marginTop: '16px' }}>
                  <li>How to search for items</li>
                  <li>Making safe payments</li>
                  <li>Meeting sellers safely</li>
                  <li>Leaving reviews</li>
                </ul>
              </div>
              
              <div className="step-card">
                <h3>💼 Selling Guide</h3>
                <p>Tips for creating great listings</p>
                <ul style={{ textAlign: 'left', marginTop: '16px' }}>
                  <li>Creating effective listings</li>
                  <li>Pricing your items</li>
                  <li>Managing orders</li>
                  <li>Building reputation</li>
                </ul>
              </div>
              
              <div className="step-card">
                <h3>🔒 Security Tips</h3>
                <p>Stay safe while using BuyBye</p>
                <ul style={{ textAlign: 'left', marginTop: '16px' }}>
                  <li>Spotting scams</li>
                  <li>Secure payments</li>
                  <li>Meeting safety</li>
                  <li>Protecting personal info</li>
                </ul>
              </div>
              
              <div className="step-card">
                <h3>💳 Payments</h3>
                <p>Understanding payment methods</p>
                <ul style={{ textAlign: 'left', marginTop: '16px' }}>
                  <li>Accepted methods</li>
                  <li>Payment protection</li>
                  <li>Refund policy</li>
                  <li>Transaction fees</li>
                </ul>
              </div>
            </div>

            <h2>Popular Help Topics</h2>
            <ul>
              <li><strong>Account Issues:</strong> Password reset, email verification, account recovery</li>
              <li><strong>Listing Problems:</strong> Items not appearing, photo upload issues, category selection</li>
              <li><strong>Order Tracking:</strong> Where's my order, tracking numbers, delivery delays</li>
              <li><strong>Payment Issues:</strong> Failed payments, refund status, payment holds</li>
              <li><strong>Communication:</strong> Messaging sellers/buyers, notification settings</li>
            </ul>

            <h2>Video Tutorials</h2>
            <p>Coming soon! We're creating step-by-step video guides to help you navigate BuyBye.</p>

            <h2>Still Need Help?</h2>
            <p>
              Can't find what you're looking for? Our support team is ready to assist you.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <a href="/support/contact" className="submit-btn">Contact Support</a>
              <a href="/support/faq" className="submit-btn" style={{ background: '#6b7280' }}>View FAQ</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
