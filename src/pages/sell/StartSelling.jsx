import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function StartSelling() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Start Selling on BuyBye</h1>
          <div className="page-content">
            <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '40px' }}>
              Join thousands of successful sellers on Egypt's fastest-growing marketplace.
            </p>

            <h2>Why Sell on BuyBye?</h2>
            <ul className="benefits-list">
              <li>✅ <strong>Millions of Active Buyers</strong> - Reach customers across Egypt</li>
              <li>✅ <strong>Easy-to-Use Dashboard</strong> - Manage everything in one place</li>
              <li>✅ <strong>Secure Payments</strong> - Get paid safely and on time</li>
              <li>✅ <strong>Low Commission</strong> - Only 5% on successful sales</li>
              <li>✅ <strong>Marketing Tools</strong> - Promote your items effectively</li>
              <li>✅ <strong>24/7 Support</strong> - We're always here to help</li>
            </ul>

            <h2>Getting Started is Easy</h2>
            <div className="steps-grid">
              <div className="step-card">
                <span className="step-number">1</span>
                <h3>Create Account</h3>
                <p>Sign up for free in under 2 minutes. No credit card required!</p>
              </div>
              <div className="step-card">
                <span className="step-number">2</span>
                <h3>Set Up Store</h3>
                <p>Add your store profile, logo, and description</p>
              </div>
              <div className="step-card">
                <span className="step-number">3</span>
                <h3>Post Items</h3>
                <p>Create listings with photos and details</p>
              </div>
              <div className="step-card">
                <span className="step-number">4</span>
                <h3>Start Earning</h3>
                <p>Receive orders and grow your business!</p>
              </div>
            </div>

            <h2>Success Stories</h2>
            <p>
              "I started selling electronics on BuyBye 6 months ago. Now I have over 500 sales 
              and a 4.9-star rating. The platform is so easy to use!" - Ahmed M., Cairo
            </p>
            <p>
              "BuyBye helped me turn my hobby into a business. I sell handmade crafts and reach 
              customers I never could before." - Fatima K., Alexandria
            </p>

            <h2>What Can You Sell?</h2>
            <ul>
              <li>Electronics & Gadgets</li>
              <li>Fashion & Accessories</li>
              <li>Home & Garden items</li>
              <li>Sports & Fitness equipment</li>
              <li>Books & Media</li>
              <li>Handmade & Vintage items</li>
              <li>And much more!</li>
            </ul>

            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button className="cta-button-large">Become a Seller Today</button>
              <p style={{ marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
                No setup fees • No monthly charges • Only pay when you sell
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
