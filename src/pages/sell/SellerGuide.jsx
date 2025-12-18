import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function SellerGuide() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Seller Guide</h1>
          <div className="page-content">
            <p>
              Everything you need to know to succeed as a BuyBye seller.
            </p>

            <h2>Creating Great Listings</h2>
            <h3>📸 Photography Tips:</h3>
            <ul>
              <li>Use natural lighting or bright indoor lights</li>
              <li>Take photos from multiple angles (front, back, sides, close-ups)</li>
              <li>Show any defects or wear honestly</li>
              <li>Use a clean, uncluttered background</li>
              <li>Include size references when helpful</li>
              <li>Upload at least 4-6 photos per item</li>
            </ul>

            <h3>📝 Writing Descriptions:</h3>
            <ul>
              <li>Include brand, model, size, and condition</li>
              <li>Mention any defects or issues</li>
              <li>Add measurements for clothing/furniture</li>
              <li>Describe what's included in the sale</li>
              <li>State your return policy clearly</li>
              <li>Use bullet points for easy reading</li>
            </ul>

            <h3>💰 Pricing Strategy:</h3>
            <ul>
              <li>Research similar items on BuyBye</li>
              <li>Consider item condition and age</li>
              <li>Factor in shipping costs</li>
              <li>Price slightly high to allow negotiation room</li>
              <li>Offer bundle deals for multiple items</li>
              <li>Update prices if items don't sell</li>
            </ul>

            <h2>Managing Orders</h2>
            <h3>Order Process:</h3>
            <ol>
              <li><strong>New Order Received</strong> - Accept within 24 hours</li>
              <li><strong>Prepare Item</strong> - Pack securely with bubble wrap/padding</li>
              <li><strong>Ship Promptly</strong> - Use tracking and insurance for valuable items</li>
              <li><strong>Update Status</strong> - Mark as shipped with tracking number</li>
              <li><strong>Follow Up</strong> - Ensure buyer received item</li>
            </ol>

            <h3>Communication Best Practices:</h3>
            <ul>
              <li>Respond to messages within 24 hours</li>
              <li>Be professional and friendly</li>
              <li>Answer questions thoroughly</li>
              <li>Provide order updates proactively</li>
              <li>Handle issues calmly and fairly</li>
            </ul>

            <h2>Growing Your Business</h2>
            <div className="steps-grid">
              <div className="step-card" style={{ textAlign: 'left' }}>
                <h3>🎯 Build Trust</h3>
                <ul>
                  <li>Ship on time</li>
                  <li>Be honest in descriptions</li>
                  <li>Provide great service</li>
                  <li>Request reviews</li>
                </ul>
              </div>
              
              <div className="step-card" style={{ textAlign: 'left' }}>
                <h3>📈 Increase Sales</h3>
                <ul>
                  <li>Post regularly</li>
                  <li>Offer competitive prices</li>
                  <li>Run promotions</li>
                  <li>Share on social media</li>
                </ul>
              </div>
            </div>

            <h2>Seller Dashboard Features</h2>
            <ul>
              <li><strong>Analytics:</strong> Track views, favorites, and sales</li>
              <li><strong>Inventory Management:</strong> Keep stock levels updated</li>
              <li><strong>Order Management:</strong> Process and fulfill orders</li>
              <li><strong>Messaging:</strong> Communicate with buyers</li>
              <li><strong>Promotions:</strong> Create discounts and deals</li>
              <li><strong>Reports:</strong> View sales and performance data</li>
            </ul>

            <h2>Common Mistakes to Avoid</h2>
            <ul>
              <li>❌ Poor quality photos</li>
              <li>❌ Incomplete descriptions</li>
              <li>❌ Slow response times</li>
              <li>❌ Inaccurate inventory</li>
              <li>❌ Overpricing items</li>
              <li>❌ Poor packaging leading to damage</li>
            </ul>

            <h2>Need More Help?</h2>
            <p>
              Check out our detailed video tutorials, join our seller community forum, or 
              contact our seller support team for personalized assistance.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}