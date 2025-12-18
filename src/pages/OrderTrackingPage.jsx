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

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);

  // Status colors
  const statusColors = {
    New: "#FFA500",
    Accepted: "#1E90FF",
    Packed: "#6f42c1",
    Shipped: "#1E90FF",
    Delivered: "#28A745",
    Cancelled: "#DC3545",
  };

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

          // Load comments if available
          const savedComments = data.comments || [];
          setComments(savedComments.sort((a, b) => a.ts - b.ts));
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

  // Comment handlers
  const submitComment = () => {
    if (!commentText.trim()) return alert("Enter a comment.");

    if (editingCommentId) {
      setComments((prev) =>
        prev.map((c) => (c.id === editingCommentId ? { ...c, text: commentText, ts: Date.now() } : c))
      );
      setEditingCommentId(null);
    } else {
      setComments((prev) => [...prev, { id: Date.now(), text: commentText.trim(), ts: Date.now() }]);
    }

    setCommentText("");
  };

  const editComment = (c) => {
    setEditingCommentId(c.id);
    setCommentText(c.text);
  };

  const deleteComment = (id) => {
    if (!window.confirm("Delete this comment?")) return;
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

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

          {/* Right column: comments */}
          <div className="order-right">
            <section className="comments-card">
              <h3>Comments</h3>
              <textarea
                placeholder="Add a comment about your order..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="comment-actions">
                <button className="primary" onClick={submitComment}>
                  {editingCommentId ? "Update Comment" : "Add Comment"}
                </button>
                {editingCommentId && (
                  <button
                    className="secondary"
                    onClick={() => {
                      setEditingCommentId(null);
                      setCommentText("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="muted">No comments yet.</p>
                ) : (
                  comments.slice().reverse().map((c) => (
                    <div className="comment-row" key={c.id}>
                      <div className="comment-meta">
                        <span className="comment-ts">{new Date(c.ts).toLocaleString()}</span>
                      </div>
                      <div className="comment-text">{c.text}</div>
                      <div className="comment-actions">
                        <button onClick={() => editComment(c)} className="small">
                          Edit
                        </button>
                        <button onClick={() => deleteComment(c.id)} className="small danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
