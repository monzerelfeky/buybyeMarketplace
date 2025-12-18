
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function TrustSafety() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Trust & Safety</h1>
          <div className="page-content">
            <p>
              Your safety is our top priority. We've implemented multiple layers of protection 
              to ensure secure transactions on BuyBye.
            </p>

            <h2>🛡️ Safety Features</h2>
            <ul className="benefits-list">
              <li>✅ <strong>Verified Seller Badges</strong> - Trusted sellers earn verification after meeting our standards</li>
              <li>✅ <strong>Secure Payment Processing</strong> - All transactions are encrypted and protected</li>
              <li>✅ <strong>Buyer Protection Program</strong> - Get refunds if items don't match descriptions</li>
              <li>✅ <strong>24/7 Support Team</strong> - Our support team is always available to help</li>
              <li>✅ <strong>Community Reporting</strong> - Report suspicious activity instantly</li>
              <li>✅ <strong>Identity Verification</strong> - Optional ID verification for added trust</li>
            </ul>

            <h2>👥 Meeting Safely</h2>
            <h3>For In-Person Transactions:</h3>
            <ul>
              <li><strong>Choose Public Places</strong> - Meet at busy cafes, malls, or police stations</li>
              <li><strong>Bring a Friend</strong> - Never meet alone, especially for high-value items</li>
              <li><strong>Daytime Meetings</strong> - Schedule meetings during daylight hours</li>
              <li><strong>Tell Someone</strong> - Share meeting details with a trusted person</li>
              <li><strong>Trust Your Instincts</strong> - If something feels wrong, walk away</li>
            </ul>

            <h2>🔒 Payment Security</h2>
            <h3>Safe Payment Methods:</h3>
            <ul>
              <li>Use BuyBye's secure payment platform</li>
              <li>Credit/debit cards with fraud protection</li>
              <li>Cash on delivery for verified sellers</li>
              <li>Bank transfers with tracking</li>
            </ul>

            <h3>Avoid These Payment Methods:</h3>
            <ul>
              <li>❌ Wire transfers to unknown recipients</li>
              <li>❌ Payments to foreign accounts</li>
              <li>❌ Cryptocurrency (unless you're experienced)</li>
              <li>❌ Gift cards or prepaid cards</li>
            </ul>

            <h2>🚩 Recognizing Scams</h2>
            <h3>Red Flags to Watch For:</h3>
            <ul>
              <li>Prices that seem too good to be true</li>
              <li>Sellers who refuse to meet in person</li>
              <li>Requests for payment before viewing item</li>
              <li>Pressure to act quickly</li>
              <li>Poor communication or vague answers</li>
              <li>Requests to move conversation off-platform</li>
            </ul>

            <h2>📞 Report Issues</h2>
            <p>
              If you encounter suspicious activity, scams, or safety concerns:
            </p>
            <ul>
              <li>Use the "Report" button on any listing or profile</li>
              <li>Contact our support team immediately</li>
              <li>Provide as much detail as possible</li>
              <li>We investigate all reports within 24 hours</li>
            </ul>

            <h2>🎓 Safety Resources</h2>
            <p>
              Visit our Help Center for detailed safety guides, tutorials, and best practices. 
              We regularly update our safety resources based on the latest security trends.
            </p>

            <h2>🤝 Our Commitment</h2>
            <p>
              We continuously invest in security technology, train our support team, and work 
              with law enforcement to keep BuyBye safe. Your trust is our most valuable asset, 
              and we work every day to protect it.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}