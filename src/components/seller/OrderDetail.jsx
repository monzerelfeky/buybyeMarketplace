// src/components/OrderDetail.jsx
import React, { useState } from "react";
import "../../styles/seller/orderDetail.css";

export default function OrderDetail({ order, onClose, onUpdate, onNotify }) {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking || "");

  const flow = ["New", "Accepted", "Packed", "Shipped", "Delivered"];

  const normalizedItems = order.items.map((item) => ({
  name: item.name || "Unknown Item",
  price: Number(item.price) || 0,
  quantity: Number(item.quantity) || 0,
  }));

  const updateStatus = (newStatus) => {
    if (newStatus === "Cancel") {
      if (window.confirm("Are you sure you want to cancel this order?")) {
        setStatus("Cancelled");
        onUpdate(order.id, { status: "Cancelled" });
        onNotify?.("Order cancelled ✖", "error");
      }
      return;
    }


    const current = flow.indexOf(status);
    const next = flow.indexOf(newStatus);

    if (next > current) {
      setStatus(newStatus);
      onUpdate(order.id, { status: newStatus });

      const messages = {
        Accepted: "Order accepted ✔",
        Packed: "Order packed 📦",
        Shipped: "Order shipped 🚚",
        Delivered: "Order delivered 🎉",
      };

      if (messages[newStatus]) onNotify?.(messages[newStatus], "success");
    }
  };

  const getStatusColor = () => {
    const colors = {
      New: "#f59e0b",
      Accepted: "#10b981",
      Packed: "#3b82f6",
      Shipped: "#8b5cf6",
      Delivered: "#059669",
      Cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

const total = normalizedItems.reduce(
(sum, item) => sum + item.price * item.quantity,0);

  const currentIndex = status === "Cancelled" ? -1 : flow.indexOf(status);

  return (
    <>
      <div className="od-header-no-close">
        <h1 className="od-title">Order #{order.id}</h1>
      </div>

      <div
        className="od-status-badge"
        style={{ backgroundColor: getStatusColor() }}
      >
        {status}
      </div>

      {/* TIMELINE */}
      <div className="od-timeline">
        {flow.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={step} className="od-timeline-step">
              <div
                className={`od-timeline-dot ${
                  isCompleted ? "completed" : ""
                } ${isActive ? "active" : ""}`}
              />
              <span className="od-timeline-label">{step}</span>
              {index < flow.length - 1 && (
                <div
                  className={`od-timeline-line ${
                    index < currentIndex ? "completed" : ""
                  }`}
                />
              )}
            </div>
          );
        })}

        {status === "Cancelled" && (
          <div className="od-timeline-cancelled">Cancelled</div>
        )}
      </div>

      <div className="od-content">
        {/* ITEMS */}
        <section className="od-section">
          <h2 className="od-section-title">Order Items</h2>
          <div className="od-items">
            {normalizedItems.map((item, index) => (
            <div key={index} className="od-item">
              <span className="od-item-name">{item.name}</span>
              <span className="od-item-qty">×{item.quantity}</span>
              <span className="od-item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}


            <div className="od-total-row">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>
        </section>

        {/* BUYER INFO */}
        <section className="od-section">
          <h2 className="od-section-title">Buyer Information</h2>

          <div className="od-info-grid">
            <div>
              <p className="od-label">Name</p>
              <p className="od-value">{order.buyerName || order.buyer?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="od-label">Email</p>
              <p className="od-value">{order.buyerEmail || order.buyer?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="od-label">Phone</p>
              <p className="od-value">{order.buyerPhone || order.buyer?.phone || 'N/A'}</p>
            </div>
            <div className="od-full">
              <p className="od-label">Delivery Address</p>
              <p className="od-value">
                {order.deliveryAddress?.addressLine1 
                  ? `${order.deliveryAddress.addressLine1}${order.deliveryAddress.addressLine2 ? ', ' + order.deliveryAddress.addressLine2 : ''} ${order.deliveryAddress.city || ''} ${order.deliveryAddress.postalCode || ''}`.trim()
                  : (order.buyer?.address || 'N/A')}
              </p>
            </div>
            <div className="od-full">
              <p className="od-label">Buyer Notes</p>
              <p className="od-value">{order.buyerNotes || order.buyer?.notes || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* PAYMENT SUMMARY */}
        <section className="od-section">
          <h2 className="od-section-title">Payment Summary</h2>
          <div className="od-payment">
            <div className="od-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="od-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="od-row total">
              <strong>Total Paid</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>
        </section>

        {/* STATUS ACTIONS */}
        <section className="od-section">
          <h2 className="od-section-title">Update Status</h2>

          <div className="od-actions">
            {status === "New" && (
              <>
                <button
                  className="od-btn primary"
                  onClick={() => updateStatus("Accepted")}
                >
                  Accept Order
                </button>
                <button
                  className="od-btn danger"
                  onClick={() => updateStatus("Cancel")}
                >
                  Cancel Order
                </button>
              </>
            )}

            {status === "Accepted" && (
              <button
                className="od-btn primary"
                onClick={() => updateStatus("Packed")}
              >
                Mark as Packed
              </button>
            )}

            {status === "Packed" && (
              <button
                className="od-btn primary"
                onClick={() => updateStatus("Shipped")}
              >
                Mark as Shipped
              </button>
            )}

            {status === "Shipped" && (
              <button
                className="od-btn primary"
                onClick={() => updateStatus("Delivered")}
              >
                Mark as Delivered
              </button>
            )}

            {["Delivered", "Cancelled"].includes(status) && (
              <p className="od-final-msg">
                Order is {status.toLowerCase()} — no further actions.
              </p>
            )}
          </div>
        </section>

        {/* TRACKING NUMBER */}
        {(status === "Packed" ||
          status === "Shipped" ||
          status === "Delivered") && (
          <section className="od-section tracking-section">
            <h2 className="od-section-title">Tracking Number</h2>

            <div className={`tracking-box ${trackingNumber ? "active" : ""}`}>
              <span className="tracking-icon">🚚</span>

              <input
                type="text"
                className="tracking-input"
                value={trackingNumber}
                onChange={(e) => {
                  setTrackingNumber(e.target.value);
                  onUpdate(order.id, { tracking: e.target.value });
                  onNotify?.("Tracking number updated 📦", "info");
                }}
                placeholder="Enter tracking code..."
              />

              {trackingNumber && (
                <button
                  className="tracking-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(trackingNumber);
                    onNotify?.("Tracking copied!", "success");
                  }}
                >
                  ⧉
                </button>
              )}
            </div>

            {trackingNumber && (
              <p className="tracking-helper">
                Carrier auto-detect enabled · Saved just now
              </p>
            )}
          </section>
        )}

        {/* NOTES */}
        <section className="od-section">
          <h2 className="od-section-title">Delivery Notes</h2>
          <textarea
            className="od-textarea"
            defaultValue={order.buyerNotes || order.buyer?.notes || "No notes provided."}
            readOnly
          />
        </section>
      </div>
    </>
  );
}
