
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Logo + BuyBye Title */}
        <div className="footer-brand-section">
          <div className="footer-logo"></div>
          <div className="footer-brand-text">
            <h2 className="footer-brand-name">BuyBye</h2>
            <p className="footer-tagline">Your trusted marketplace in Egypt</p>
          </div>
        </div>

        {/* Footer Links - NOW WITH ROUTER LINKS */}
        <div className="footer-links">
          
          <div className="footer-col">
            <h3 className="footer-heading">About Us</h3>
            <Link to="/about/our-story" className="footer-link">Our Story</Link>
            <Link to="/about/how-it-works" className="footer-link">How It Works</Link>
            <Link to="/about/trust-safety" className="footer-link">Trust & Safety</Link>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Policies</h3>
            <Link to="/policies/shipping" className="footer-link">Shipping Policy</Link>
            <Link to="/policies/return" className="footer-link">Return Policy</Link>
            <Link to="/policies/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/policies/terms" className="footer-link">Terms of Service</Link>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Support</h3>
            <Link to="/support/contact" className="footer-link">Contact Us</Link>
            <Link to="/support/faq" className="footer-link">FAQ</Link>
            <Link to="/support/help" className="footer-link">Help Center</Link>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Sell</h3>
            <Link to="/sell/start" className="footer-link">Start Selling</Link>
            <Link to="/sell/guide" className="footer-link">Seller Guide</Link>
            <Link to="/sell/fees" className="footer-link">Fees & Pricing</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BuyBye Egypt • Made with love in Cairo</p>
      </div>
    </footer>
  );
}