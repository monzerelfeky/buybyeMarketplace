
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function HowItWorks() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">How It Works</h1>
          <div className="page-content">
            
            <div className="section">
              <h2>🛍️ For Buyers</h2>
              <p>Finding and purchasing items on BuyBye is simple:</p>
              <ol>
                <li><strong>Browse & Search</strong> - Explore thousands of listings across categories like Cars, Real Estate, Electronics, and more</li>
                <li><strong>Find What You Need</strong> - Use filters and search to narrow down your options</li>
                <li><strong>Contact Sellers</strong> - Message sellers directly to ask questions or negotiate prices</li>
                <li><strong>Arrange Meeting</strong> - Meet safely in public places or arrange secure delivery</li>
                <li><strong>Complete Purchase</strong> - Pay securely and enjoy your new item</li>
                <li><strong>Leave Feedback</strong> - Rate your experience to help other buyers</li>
              </ol>

              <h3>Buyer Tips</h3>
              <ul>
                <li>Always verify item condition before purchasing</li>
                <li>Meet in well-lit, public locations</li>
                <li>Bring a friend when viewing high-value items</li>
                <li>Use secure payment methods</li>
                <li>Check seller ratings and reviews</li>
              </ul>
            </div>

            <div className="section">
              <h2>💼 For Sellers</h2>
              <p>Selling on BuyBye is easy and profitable:</p>
              <ol>
                <li><strong>Create Account</strong> - Sign up for free in under 2 minutes</li>
                <li><strong>Activate Seller Mode</strong> - Switch to seller dashboard with one click</li>
                <li><strong>Post Your Items</strong> - Add photos, descriptions, and pricing</li>
                <li><strong>Manage Inquiries</strong> - Respond to buyer questions through our messaging system</li>
                <li><strong>Process Orders</strong> - Accept orders and arrange delivery or pickup</li>
                <li><strong>Build Reputation</strong> - Earn positive reviews and grow your business</li>
              </ol>

              <h3>Seller Tips</h3>
              <ul>
                <li>Take clear, well-lit photos from multiple angles</li>
                <li>Write detailed, honest descriptions</li>
                <li>Price competitively by researching similar items</li>
                <li>Respond quickly to buyer inquiries</li>
                <li>Package items securely for shipping</li>
                <li>Provide excellent customer service</li>
              </ul>
            </div>

            <h2>🔐 Safe Transaction Process</h2>
            <p>
              We've designed BuyBye with safety at its core. Our platform includes verified seller 
              badges, secure payment processing, buyer protection programs, and 24/7 support to 
              ensure every transaction is safe and successful.
            </p>

            <h2>📱 Available Everywhere</h2>
            <p>
              Access BuyBye from any device—desktop, tablet, or mobile. Our responsive design 
              ensures a seamless experience wherever you are.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
