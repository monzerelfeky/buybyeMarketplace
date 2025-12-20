import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/OrderTrackingPage.css";

const STATUS_STEPS = ["New", "Accepted", "Packed", "Shipped", "Delivered"];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

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
  const historyIndexes = statusHistory
    .map((s) => STATUS_STEPS.indexOf(s.status))
    .filter((idx) => idx >= 0);
  const currentStatusIndex = historyIndexes.length
    ? Math.max(...historyIndexes)
    : STATUS_STEPS.indexOf(order.status || "New");

  const canCancel = ["New", "Accepted"].includes(order.status);
  const isCancelled = order.status === "Cancelled";

  const handleCancelOrder = async () => {
    if (!canCancel || cancelLoading) return;
    if (!window.confirm("Cancel this order? This action cannot be undone.")) return;
    setCancelLoading(true);
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/orders/${order._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled", note: "Cancelled by buyer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel order");
      setOrder(data);
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Failed to cancel order.");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="order-tracking-page">
        <div className="order-header">
          <h1>Order #{order.orderNo || order._id}</h1>
          <div className="order-meta">
            <span>
              Total: <strong>${order.totalPrice}</strong>
            </span>
            <span>
              Placed: {order.placedAt ? new Date(order.placedAt).toLocaleString() : "N/A"}
            </span>
          </div>
        </div>

        <div className="order-main">
          {/* Left column: timeline */}
          <div className="order-left">
            <section className="timeline-card">
              <h2>Order Status</h2>
              {order.status === "Cancelled" && (
                <div className="order-cancelled-banner">
                  Cancelled on{" "}
                  {order.updatedAt
                    ? new Date(order.updatedAt).toLocaleString()
                    : "N/A"}
                </div>
              )}
              <ol className="timeline">
                {STATUS_STEPS.map((step, idx) => (
                  <li key={step} className={`timeline-step ${idx <= currentStatusIndex ? "active" : ""}`}>
                    <div className="step-marker-wrap">
                      <div
                        className={`step-marker ${idx < currentStatusIndex ? "completed" : ""} ${
                          idx === currentStatusIndex ? "active" : ""
                        }`}
                        style={{
                          backgroundColor: idx <= currentStatusIndex ? statusColors[step] : "#ccc",
                          color: idx <= currentStatusIndex ? statusColors[step] : "#ccc",
                        }}
                      >
                        {idx + 1}
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`step-line ${idx < currentStatusIndex ? "completed" : ""}`} />
                      )}
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

          {/* Right column: Actions */}
          <div className="order-right">
            <section className="report-issue-card">
              <h3>Manage Order</h3>
              <p>You can cancel this order before it is packed.</p>
              <div className="report-buttons">
                <button
                  className="secondary cancel-btn"
                  onClick={handleCancelOrder}
                  disabled={!canCancel || cancelLoading || isCancelled}
                >
                  {isCancelled ? "Order Cancelled" : cancelLoading ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            </section>
            <section className="report-issue-card">
              <h3>Report an Issue</h3>
              <p>If you faced any issue with this order, you can report it:</p>
              
              <div className="report-buttons">
                <button
                  className="secondary"
                  onClick={() => navigate(`/report-seller/${order._id}`)}
                >
                  Flag the seller
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
