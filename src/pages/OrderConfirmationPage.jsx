import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const orderId = Math.floor(100000 + Math.random() * 900000);
  const estimatedDelivery = "3 – 5 business days";

  return (
    <>
      <Header />

      <div className="order-confirmation-container">
        <div className="order-confirmation-card">

          <h2 className="order-confirmation-title">Order Confirmed 🎉</h2>

          <div className="order-info-row">
            <p className="order-info-label">Order ID:</p>
            <p className="order-info-value">#{orderId}</p>
          </div>

          <div className="order-info-row">
            <p className="order-info-label">Estimated Delivery:</p>
            <p className="order-info-value">{estimatedDelivery}</p>
          </div>

          <h3 className="seller-contact-title" style={{ marginTop: "25px" }}>
            Order Summary
          </h3>

          <div className="order-summary-box">
            <div className="order-summary-item">
              <span className="order-summary-label">Subtotal</span>
              <span className="order-summary-value">$120.00</span>
            </div>

            <div className="order-summary-item">
              <span className="order-summary-label">Shipping</span>
              <span className="order-summary-value">$10.00</span>
            </div>

            <div className="order-summary-item">
              <span className="order-summary-label">Total</span>
              <span className="order-summary-value">$130.00</span>
            </div>
          </div>

          <div className="seller-contact-box">
            <p className="seller-contact-title">Seller Contact</p>
            <p className="seller-contact-text">
              Email: seller@example.com <br />
              Phone: +20 111 222 3333 <br />
              For any queries regarding your order, feel free to reach out.
            </p>
          </div>

          <button
            className="return-home-btn"
            onClick={() => (window.location.href = "/")}
          >
            Return to Home
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default OrderConfirmationPage;
