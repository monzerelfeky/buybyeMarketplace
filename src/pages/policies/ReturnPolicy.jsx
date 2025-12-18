
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function ReturnPolicy() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Return Policy</h1>
          <div className="page-content">
            <p>
              We want you to be completely satisfied with your purchase. Review our 
              return policy below to understand your options.
            </p>

            <h2>⏰ Return Window</h2>
            <p>
              <strong>14-Day Return Period:</strong> Items can be returned within 14 days of 
              delivery for a full refund, provided they meet our return conditions.
            </p>

            <h2>✅ Eligible for Return</h2>
            <p>Items can be returned if they are:</p>
            <ul>
              <li>In original, unused condition</li>
              <li>In original packaging with all tags attached</li>
              <li>Complete with all accessories and manuals</li>
              <li>Not damaged by customer</li>
              <li>Significantly different from description</li>
              <li>Defective or damaged upon arrival</li>
            </ul>

            <h2>❌ Non-Returnable Items</h2>
            <p>The following items cannot be returned:</p>
            <ul>
              <li>Personalized or custom-made items</li>
              <li>Perishable goods (food, flowers, etc.)</li>
              <li>Intimate or sanitary items (underwear, earrings)</li>
              <li>Opened electronics or software</li>
              <li>Digital products or downloads</li>
              <li>Items marked as "Final Sale" or "No Returns"</li>
              <li>Gift cards or vouchers</li>
            </ul>

            <h2>📝 Return Process</h2>
            <ol>
              <li><strong>Contact Seller</strong> - Within 14 days, message the seller through BuyBye</li>
              <li><strong>Provide Details</strong> - Explain reason for return with photos if applicable</li>
              <li><strong>Get Approval</strong> - Wait for seller to approve return</li>
              <li><strong>Package Item</strong> - Use original packaging when possible</li>
              <li><strong>Ship Back</strong> - Send item with tracking to seller's address</li>
              <li><strong>Receive Refund</strong> - Refund processed within 5-7 days of receipt</li>
            </ol>

            <h2>💳 Refund Methods</h2>
            <p>Refunds are issued using your original payment method:</p>
            <ul>
              <li><strong>Credit/Debit Card</strong> - 5-7 business days</li>
              <li><strong>Bank Transfer</strong> - 3-5 business days</li>
              <li><strong>BuyBye Wallet</strong> - Instant credit</li>
            </ul>

            <h2>🚚 Return Shipping Costs</h2>
            <ul>
              <li><strong>Defective/Wrong Item:</strong> Seller pays return shipping</li>
              <li><strong>Changed Mind:</strong> Buyer pays return shipping</li>
              <li><strong>Free Returns:</strong> Some sellers offer free returns—check listing</li>
            </ul>

            <h2>🔄 Exchanges</h2>
            <p>
              Direct exchanges are handled between buyer and seller. Contact the seller to 
              arrange an exchange if available. Not all sellers offer exchanges.
            </p>

            <h2>🛡️ Buyer Protection</h2>
            <p>If a seller refuses a valid return:</p>
            <ol>
              <li>Contact BuyBye Support with order details</li>
              <li>Provide evidence (photos, messages, tracking)</li>
              <li>We'll mediate and enforce our return policy</li>
              <li>You may be eligible for a refund from BuyBye</li>
            </ol>

            <h2>⚖️ Seller Responsibilities</h2>
            <p>Sellers must:</p>
            <ul>
              <li>Clearly state their return policy in listings</li>
              <li>Accept returns within the 14-day window</li>
              <li>Process refunds within 7 days of receiving return</li>
              <li>Provide return address for shipped items</li>
            </ul>

            <h2>📞 Questions?</h2>
            <p>
              Contact our support team for return-related questions:
              <br />Email: returns@buybye.eg
              <br />Phone: +20 2 1234 5678
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
