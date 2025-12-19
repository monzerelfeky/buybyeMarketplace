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

  const statusColors = {
    New: "#f59e0b",
    Accepted: "#10b981",
    Packed: "#3b82f6",
    Shipped: "#8b5cf6",
    Delivered: "#059669",
    Cancelled: "#ef4444",
  };

  const currentIndex = STATUS_STEPS.indexOf(order.status || "New");

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

              <div className="od-timeline">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentIndex && order.status !== "Cancelled";
                  const isActive = index === currentIndex;

                  return (
                    <div key={step} className="od-timeline-step">
                      <div
                        className={`od-timeline-dot ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                        style={{ backgroundColor: isCompleted ? statusColors[step] : "#ccc" }}
                      />
                      <span className="od-timeline-label">{step}</span>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`od-timeline-line ${index < currentIndex && order.status !== "Cancelled" ? "completed" : ""}`}
                          style={{ backgroundColor: index < currentIndex && order.status !== "Cancelled" ? statusColors[step] : "#ccc" }}
                        />
                      )}
                    </div>
                  );
                })}

                {order.status === "Cancelled" && (
                  <div className="od-timeline-cancelled">Cancelled</div>
                )}
              </div>
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
                  Flag seller
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
