import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/OrderTrackingPage.css";

const STATUS_STEPS = ["New", "Accepted", "Packed", "Shipped", "Delivered", "Cancelled"];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  // Fetch order from backend
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setServerError("");

      try {
        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setServerError(data.message || "Failed to fetch order");
          setOrder(null);
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error("Fetch order error:", err);
        setServerError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="order-tracking-page">
          <p>Loading order...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="order-tracking-page">
          <p className="form-error">{serverError || "Order not found"}</p>
        </div>
        <Footer />
      </>
    );
  }

  // Status colors
  const statusColors = {
    New: "#FFA500",
    Accepted: "#1E90FF",
    Packed: "#6f42c1",
    Shipped: "#1E90FF",
    Delivered: "#28A745",
    Cancelled: "#DC3545",
  };

  // Determine current status index from status history
  const statusHistory = order.statusHistory || [];
  const currentStatusIndex = statusHistory.length
    ? Math.max(...statusHistory.map((s) => STATUS_STEPS.indexOf(s.status)))
    : 0;

  return (
    <>
      <Header />
      <div className="order-tracking-page">
        <div className="order-header">
          <h1>Order #{order.orderNo || order._id}</h1>
          <div className="order-meta">
            <span>Total: <strong>${order.totalPrice}</strong></span>
            <span>Placed: {order.placedAt ? new Date(order.placedAt).toLocaleString() : "N/A"}</span>
          </div>
        </div>

        <div className="order-main">
          {/* Left column: timeline */}
          <div className="order-left">
            <section className="timeline-card">
              <h2>Order Status</h2>
              <ol className="timeline">
                {STATUS_STEPS.map((step, idx) => (
                  <li key={step} className={`timeline-step ${idx <= currentStatusIndex ? "active" : ""}`}>
                    <div className="step-marker" style={{ backgroundColor: idx <= currentStatusIndex ? statusColors[step] : "#ccc" }}>
                      {idx + 1}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step}</div>
                      {statusHistory.filter((u) => u.status === step).map((u) => (
                        <div key={u.changedAt} className="update-item">
                          <div className="update-ts">{u.changedAt ? new Date(u.changedAt).toLocaleString() : ""}</div>
                          {u.note && <div className="update-msg">{u.note}</div>}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Right column: Report Issue */}
          <div className="order-right">
            <section className="report-issue-card">
              <h3>Report an Issue</h3>
              <p>If you faced any issue with this order, you can report it:</p>
              
              <div className="report-buttons">
                <button
                  className="primary"
                  onClick={() => navigate(`/report-order`)}
                >
                  Report a product
                </button>

                <button
                  className="secondary"
                  onClick={() => navigate(`/report-seller`)}
                >
                  flag seller
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
