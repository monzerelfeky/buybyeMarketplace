import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function FAQ() {
  const faqs = [
    { 
      q: "How do I create an account?", 
      a: "Click 'Sign Up' in the top right corner and follow the registration process. It takes less than 2 minutes! You'll need an email address and phone number." 
    },
    { 
      q: "Is BuyBye free to use?", 
      a: "Yes! Creating an account and browsing is completely free. Sellers pay a small 5% commission only on successful sales." 
    },
    { 
      q: "How do I post an item for sale?", 
      a: "Click 'Post Ad', fill in item details (title, description, price, category), upload clear photos, and publish. Your listing goes live immediately!" 
    },
    { 
      q: "How do payments work?", 
      a: "Buyers can pay securely through our platform using credit/debit cards, or arrange direct payment with sellers. All platform payments are encrypted and protected." 
    },
    { 
      q: "What if I have an issue with a purchase?", 
      a: "Contact our support team immediately through the Help Center. We'll help mediate disputes and may provide refunds under our buyer protection program." 
    },
    { 
      q: "How long does shipping take?", 
      a: "Standard shipping takes 3-5 business days. Express delivery is available for 1-2 day delivery. Same-day delivery is available in select Cairo areas." 
    },
    { 
      q: "Can I edit my listing after posting?", 
      a: "Yes! Go to your seller dashboard, find the item under 'Your Items', and click 'Edit' to update details, photos, or pricing." 
    },
    { 
      q: "What categories can I sell in?", 
      a: "We support Cars, Real Estate, Mobiles, Jobs, Electronics, Home & Garden, Fashion, Sports, and many more categories." 
    },
    {
      q: "How do I become a verified seller?",
      a: "Maintain excellent ratings, complete at least 10 sales, and verify your identity. Verified sellers get a badge and increased visibility."
    },
    {
      q: "What payment methods are accepted?",
      a: "Credit/debit cards (Visa, Mastercard), bank transfers, cash on delivery, and BuyBye wallet. Sellers can specify which methods they accept."
    },
    {
      q: "Can I cancel an order?",
      a: "Yes, orders can be canceled before shipping. Once shipped, you'll need to follow our return policy. Contact the seller or support for assistance."
    },
    {
      q: "How do I report a problem or scam?",
      a: "Use the 'Report' button on any listing or user profile, or contact support@buybye.eg immediately. We investigate all reports within 24 hours."
    }
  ];

  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Frequently Asked Questions</h1>
          <div className="page-content">
            <p style={{ textAlign: 'center', fontSize: '18px', marginBottom: '40px' }}>
              Find answers to the most common questions about using BuyBye.
            </p>
            
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <h3 className="faq-question">{faq.q}</h3>
                  <p className="faq-answer">{faq.a}</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '18px', marginBottom: '16px' }}>Still have questions?</p>
              <a href="/support/contact" className="cta-button-large">Contact Support</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}