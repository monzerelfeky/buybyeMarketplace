
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function TermsOfService() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Terms of Service</h1>
          <div className="page-content">
            <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
            <p>
              By using BuyBye, you agree to these Terms of Service. Please read them carefully.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using BuyBye ("the Platform"), you agree to be bound by these Terms 
              of Service and our Privacy Policy. If you don't agree, please don't use our services.
            </p>

            <h2>2. Eligibility</h2>
            <p>To use BuyBye, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Have the legal capacity to enter contracts</li>
              <li>Not be prohibited from using the service under Egyptian law</li>
              <li>Provide accurate registration information</li>
              <li>Maintain only one account</li>
            </ul>

            <h2>3. Account Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of unauthorized access</li>
              <li>Keeping your contact information up to date</li>
              <li>Not sharing your account with others</li>
            </ul>

            <h2>4. Prohibited Activities</h2>
            <p>You may NOT:</p>
            <ul>
              <li>❌ Sell counterfeit, stolen, or illegal items</li>
              <li>❌ Engage in fraud or deceptive practices</li>
              <li>❌ Harass, threaten, or abuse other users</li>
              <li>❌ Post false or misleading information</li>
              <li>❌ Use automated bots or scrapers</li>
              <li>❌ Circumvent our fees or policies</li>
              <li>❌ Interfere with platform operation</li>
              <li>❌ Violate intellectual property rights</li>
              <li>❌ Spam or send unsolicited messages</li>
            </ul>

            <h2>5. Listing Requirements</h2>
            <p>All listings must:</p>
            <ul>
              <li>Accurately describe the item</li>
              <li>Include clear, truthful photos</li>
              <li>State the correct price and availability</li>
              <li>Be placed in the appropriate category</li>
              <li>Comply with Egyptian laws and regulations</li>
              <li>Not contain prohibited content</li>
            </ul>

            <h2>6. Transactions</h2>
            <p>
              <strong>Buyer-Seller Relationship:</strong> Transactions occur directly between 
              buyers and sellers. BuyBye is a platform facilitating these connections but is 
              not a party to the transaction.
            </p>
            <p>
              <strong>Payment:</strong> You agree to pay all fees associated with your purchases 
              and to use valid payment methods.
            </p>
            <p>
              <strong>Seller Obligations:</strong> Sellers must deliver items as described, within 
              agreed timeframes, and honor their return policies.
            </p>

            <h2>7. Fees and Payments</h2>
            <p>
              <strong>Seller Fees:</strong> We charge a 5% commission on successful sales plus 
              payment processing fees (2.9%). Fees are non-refundable.
            </p>
            <p>
              <strong>Buyer Fees:</strong> Buyers don't pay platform fees but may pay shipping 
              costs and applicable taxes.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              <strong>Platform Content:</strong> All BuyBye branding, design, and content are our 
              property. You may not copy, modify, or redistribute without permission.
            </p>
            <p>
              <strong>User Content:</strong> You retain ownership of content you post but grant 
              us a license to use, display, and promote it on our platform.
            </p>

            <h2>9. Disclaimers</h2>
            <p>
              <strong>Platform Use:</strong> BuyBye is provided "as is" without warranties. We don't 
              guarantee uninterrupted or error-free service.
            </p>
            <p>
              <strong>User Verification:</strong> We don't verify the identity of all users or the 
              accuracy of all listings.
            </p>
            <p>
              <strong>Third-Party Services:</strong> We're not responsible for third-party services 
              (shipping, payment processors) linked to our platform.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, BuyBye is not liable for:
            </p>
            <ul>
              <li>Disputes between buyers and sellers</li>
              <li>Quality, safety, or legality of items listed</li>
              <li>Accuracy of user content or listings</li>
              <li>Actions of platform users</li>
              <li>Loss of data or business</li>
              <li>Indirect or consequential damages</li>
            </ul>

            <h2>11. Dispute Resolution</h2>
            <p>
              <strong>Between Users:</strong> Buyers and sellers should attempt to resolve disputes 
              directly. BuyBye may mediate but is not obligated to do so.
            </p>
            <p>
              <strong>With BuyBye:</strong> Disputes with BuyBye shall be governed by Egyptian law 
              and resolved in Egyptian courts.
            </p>

            <h2>12. Account Termination</h2>
            <p>We may suspend or terminate your account if you:</p>
            <ul>
              <li>Violate these Terms of Service</li>
              <li>Engage in prohibited activities</li>
              <li>Pose a risk to other users or the platform</li>
              <li>Request account deletion</li>
            </ul>

            <h2>13. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. We'll notify you of significant changes. 
              Continued use after changes constitutes acceptance.
            </p>

            <h2>14. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Arab Republic of Egypt. Any disputes 
              shall be resolved in Egyptian courts.
            </p>

            <h2>15. Contact Information</h2>
            <p>
              For questions about these terms:
              <br /><strong>Email:</strong> legal@buybye.eg
              <br /><strong>Phone:</strong> +20 2 1234 5678
              <br /><strong>Address:</strong> BuyBye Egypt, Cairo, Egypt
            </p>

            <h2>16. Severability</h2>
            <p>
              If any provision of these terms is found invalid, the remaining provisions remain 
              in full effect.
            </p>

            <p style={{ marginTop: '40px', fontStyle: 'italic', color: '#64748b' }}>
              By using BuyBye, you acknowledge that you have read, understood, and agree to be 
              bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}