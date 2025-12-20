import React, { useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fallback = sessionStorage.getItem("lastOrderConfirmation");
  const payload = location.state || (fallback ? JSON.parse(fallback) : null);
  const orders = payload?.orders || [];
  const formatCurrency = (value) =>
    `EGP ${Number(value || 0).toLocaleString()}`;

  const total = useMemo(() => {
    if (payload?.total !== undefined) return payload.total;
    return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  }, [orders, payload]);

  const orderRefs = orders.map((order) => order.orderNo || order._id);
  const placedAt = orders[0]?.placedAt
    ? new Date(orders[0].placedAt).toLocaleString()
    : null;

  return (
    <>
      <Header />

      <div className="order-confirmation-container">
        <div className="order-confirmation-card">
          <h2 className="order-confirmation-title">Order confirmed</h2>

          {!orders.length ? (
            <>
              <p className="order-info-value">
                We could not load your order details. Please check your order
                history.
              </p>
              <button
                className="return-home-btn"
                onClick={() => navigate("/order-history")}
              >
                View Order History
              </button>
            </>
          ) : (
            <>
              <div className="order-info-row">
                <p className="order-info-label">Order ID:</p>
                <p className="order-info-value">
                  {orderRefs.map((ref) => `#${ref}`).join(", ")}
                </p>
              </div>

              {placedAt && (
                <div className="order-info-row">
                  <p className="order-info-label">Placed At:</p>
                  <p className="order-info-value">{placedAt}</p>
                </div>
              )}

              <h3 className="seller-contact-title" style={{ marginTop: "25px" }}>
                Order Summary
              </h3>

              <div className="order-summary-box">
                <div className="order-summary-item">
                  <span className="order-summary-label">Orders</span>
                  <span className="order-summary-value">{orders.length}</span>
                </div>

                <div className="order-summary-item">
                  <span className="order-summary-label">Items</span>
                  <span className="order-summary-value">
                    {orders.reduce(
                      (sum, order) =>
                        sum +
                        (Array.isArray(order.items)
                          ? order.items.reduce(
                              (count, item) => count + (item.quantity || 0),
                              0
                            )
                          : 0),
                      0
                    )}
                  </span>
                </div>

                <div className="order-summary-item">
                  <span className="order-summary-label">Payment</span>
                  <span className="order-summary-value">
                    {payload?.paymentMethod === "card"
                      ? "Card"
                      : "Cash on Delivery"}
                  </span>
                </div>

                <div className="order-summary-item">
                  <span className="order-summary-label">Total</span>
                  <span className="order-summary-value">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {payload?.shipping && (
                <div className="seller-contact-box">
                  <p className="seller-contact-title">Delivery Details</p>
                  <p className="seller-contact-text">
                    {payload.shipping.fullName}
                    <br />
                    {payload.shipping.address}
                    <br />
                    {payload.shipping.city}
                    {payload.shipping.postalCode ? `, ${payload.shipping.postalCode}` : ""}
                    <br />
                    {payload.shipping.phone}
                  </p>
                </div>
              )}

              <div className="seller-contact-box">
                <p className="seller-contact-title">Seller Contact</p>
                <p className="seller-contact-text">
                  {orders.map((order) => (
                    <span key={order._id || order.orderNo}>
                      {order.sellerName || "Seller"}
                      <br />
                      {order.sellerEmail ? `Email: ${order.sellerEmail}` : ""}
                      {order.sellerEmail ? <br /> : null}
                      {order.sellerPhone ? `Phone: ${order.sellerPhone}` : ""}
                      <br />
                      <br />
                    </span>
                  ))}
                  For any queries regarding your order, feel free to reach out.
                </p>
              </div>
            </>
          )}

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
