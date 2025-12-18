
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Privacy Policy</h1>
          <div className="page-content">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            <p>
              At BuyBye, we respect your privacy and are committed to protecting your personal 
              information. This policy explains how we collect, use, and safeguard your data.
            </p>

            <h2>📊 Information We Collect</h2>
            
            <h3>Information You Provide:</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email, phone number, password</li>
              <li><strong>Profile Data:</strong> Profile photo, bio, location</li>
              <li><strong>Listing Information:</strong> Product details, photos, descriptions</li>
              <li><strong>Payment Information:</strong> Credit card details (encrypted), billing address</li>
              <li><strong>Communications:</strong> Messages between buyers and sellers</li>
            </ul>

            <h3>Information Automatically Collected:</h3>
            <ul>
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
              <li><strong>Location Data:</strong> Approximate location based on IP (if enabled)</li>
              <li><strong>Cookies:</strong> Preferences, session data, analytics</li>
            </ul>

            <h2>🎯 How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Process transactions and payments</li>
              <li>Facilitate communication between buyers and sellers</li>
              <li>Improve our platform and user experience</li>
              <li>Send order updates and notifications</li>
              <li>Provide customer support</li>
              <li>Prevent fraud and ensure platform safety</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>

            <h2>🤝 Information Sharing</h2>
            <p>We DO NOT sell your personal information. We may share data with:</p>
            
            <h3>Other Users:</h3>
            <ul>
              <li>Your public profile information (username, photo, location)</li>
              <li>Listing information for items you post</li>
              <li>Ratings and reviews you leave</li>
            </ul>

            <h3>Service Providers:</h3>
            <ul>
              <li>Payment processors (Stripe, PayPal)</li>
              <li>Shipping companies</li>
              <li>Analytics services (Google Analytics)</li>
              <li>Email service providers</li>
              <li>Cloud hosting services</li>
            </ul>

            <h3>Legal Requirements:</h3>
            <ul>
              <li>Law enforcement when required by law</li>
              <li>Protection of our legal rights</li>
              <li>Compliance with Egyptian regulations</li>
            </ul>

            <h2>🔒 Data Security</h2>
            <p>We protect your information through:</p>
            <ul>
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted storage of sensitive data</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Secure payment processing (PCI DSS compliant)</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2>🍪 Cookies and Tracking</h2>
            <p>We use cookies for:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Login, security, site functionality</li>
              <li><strong>Performance Cookies:</strong> Analytics and improvements</li>
              <li><strong>Functional Cookies:</strong> Preferences and settings</li>
              <li><strong>Advertising Cookies:</strong> Relevant ads (with consent)</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>

            <h2>👤 Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request account and data deletion</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
              <li><strong>Object:</strong> Object to certain data processing</li>
            </ul>

            <h2>🧒 Children's Privacy</h2>
            <p>
              BuyBye is not intended for users under 18. We do not knowingly collect information 
              from minors. If we discover we've collected data from a minor, we will delete it immediately.
            </p>

            <h2>🔄 Data Retention</h2>
            <p>We retain your data:</p>
            <ul>
              <li>While your account is active</li>
              <li>As long as needed for business purposes</li>
              <li>To comply with legal obligations</li>
              <li>For up to 5 years after account deletion (for legal/security purposes)</li>
            </ul>

            <h2>🌍 International Transfers</h2>
            <p>
              Your data is primarily stored in Egypt. If transferred internationally, we ensure 
              appropriate safeguards are in place to protect your information.
            </p>

            <h2>📝 Changes to This Policy</h2>
            <p>
              We may update this privacy policy periodically. We'll notify you of significant 
              changes via email or platform notification. Continued use constitutes acceptance 
              of the updated policy.
            </p>

            <h2>📞 Contact Us</h2>
            <p>
              For privacy questions or to exercise your rights:
              <br /><strong>Email:</strong> privacy@buybye.eg
              <br /><strong>Phone:</strong> +20 2 1234 5678
              <br /><strong>Address:</strong> BuyBye Egypt, Cairo, Egypt
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}