import React, { useMemo, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { useSeller } from "../../context/SellerContext";

import "../../styles/seller/base.css";
import "../../styles/seller/layout.css";
import "../../styles/seller/flags.css";

function getLocalSellerId() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id || parsed?._id || parsed?.userId || null;
  } catch {
    return null;
  }
}

export default function SellerFlags() {
  const { orders, flags, flagCustomer, updateFlagStatus, loading } = useSeller();
  const [selectedOrder, setSelectedOrder] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const sellerId = useMemo(() => getLocalSellerId(), []);

  const incomingFlags = useMemo(() => {
    return flags.filter((f) => {
      const flaggedId = f.flaggedUserId?._id || f.flaggedUserId || f.flaggedUserId?.id;
      const isForSeller =
        f.flaggedUserRole === "seller" &&
        (!sellerId || (flaggedId && flaggedId.toString() === sellerId.toString()));
      return isForSeller;
    });
  }, [flags, sellerId]);

  const relatedOrder = (flag) => {
    const oid = flag.orderId?._id || flag.orderId || flag.orderId?.id;
    return orders.find((o) => o.id === oid || o._id === oid);
  };

  const orderOptions = useMemo(
    () =>
      orders.map((o) => ({
        value: o.id,
        label: `#${o.id} - ${o.buyerName || o.buyer?.name || "Buyer"} (${o.status || "Pending"})`,
      })),
    [orders]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !reason.trim()) {
      setBanner({ type: "error", message: "Select an order and add a reason." });
      return;
    }
    setSubmitting(true);
    setBanner(null);
    const result = await flagCustomer({ orderId: selectedOrder, reason: reason.trim() });
    if (result?.error) {
      setBanner({ type: "error", message: result.error });
    } else {
      setBanner({ type: "success", message: "Flag submitted for this customer." });
      setReason("");
      setSelectedOrder("");
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (flagId, status) => {
    await updateFlagStatus(flagId, status);
    setBanner({ type: "success", message: `Flag marked as ${status}.` });
  };

  const renderStatus = (status) => {
    const color =
      {
        pending: "#f59e0b",
        resolved: "#10b981",
        dismissed: "#94a3b8",
      }[status] || "#475569";
    return (
      <span className="flag-status-pill" style={{ backgroundColor: color }}>
        {status}
      </span>
    );
  };

  const working = submitting || loading.flags;

  return (
    <>
      <Header />
      <div className="page-container flags-page">
        <div className="flags-header">
          <div>
            <h1 className="page-title">Customer Flags</h1>           
          </div>
          <div className="flags-meta">
            <div className="flags-meta-card">
              <span className="meta-label">Incoming flags</span>
              <strong className="meta-value">{incomingFlags.length}</strong>
            </div>
            <div className="flags-meta-card">
              <span className="meta-label">Open</span>
              <strong className="meta-value">
                {incomingFlags.filter((f) => f.status === "pending").length}
              </strong>
            </div>
          </div>
        </div>

        <div className="flags-grid">
          <section className="card flag-form-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Flag a customer</p>
                <h3>Attach a reason to a buyer and order</h3>
              </div>
            
            </div>

            {banner && <div className={`banner banner-${banner.type}`}>{banner.message}</div>}

            <form className="flag-form" onSubmit={handleSubmit}>
              <div className="flag-form-row">
                <div className="flag-field">
                  <label className="form-label">Order</label>
                  <select
                    className="flag-input"
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                  >
                    <option value="">Select an order</option>
                    {orderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
            </div>

              <label className="form-label">Reason</label>
              <textarea
                className="flag-input flag-textarea"
                rows={4}
                placeholder="e.g. Abusive language on delivery call"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <button className="primary-btn" type="submit" disabled={working}>
                {working ? "Submitting..." : "Submit flag"}
              </button>
            </form>
          </section>

          <section className="card flags-inbox-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Flags from buyers</p>
                <h3>Issues raised about your deliveries</h3>
              </div>
              <span className="pill">{incomingFlags.length} total</span>
            </div>

            {incomingFlags.length === 0 && (
              <div className="empty-flags">No flags from buyers yet.</div>
            )}

            <div className="flag-list flag-inbox-scroll">
              {incomingFlags.map((flag) => {
                const rid = flag.id || flag._id;
                const ord = relatedOrder(flag);
                const createdAt = flag.createdAt ? new Date(flag.createdAt) : null;
                return (
                  <div key={rid} className="flag-row">
                    <div className="flag-row-main">
                      <div>
                        <div className="flag-title">
                          <span className="flag-order">Order #{ord?.id || flag.orderId}</span>
                          {renderStatus(flag.status || "pending")}
                        </div>
                        <p className="flag-reason">{flag.reason}</p>
                        <div className="flag-meta">
                          <span>{createdAt ? createdAt.toLocaleDateString() : "Unknown date"}</span>
                          {ord?.buyerName && <span>Buyer: {ord.buyerName}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flag-row-actions">
                      <button
                        className="ghost-btn"
                        onClick={() => setExpandedId(expandedId === rid ? null : rid)}
                      >
                        {expandedId === rid ? "Hide details" : "View details"}
                      </button>
                      <div className="flag-status-actions">
                        <button onClick={() => handleStatusChange(rid, "resolved")}>Resolve</button>
                        <button onClick={() => handleStatusChange(rid, "dismissed")}>Dismiss</button>
                        <button onClick={() => handleStatusChange(rid, "pending")}>Reopen</button>
                      </div>
                    </div>

                    {expandedId === rid && (
                      <div className="flag-detail">
                        <div className="detail-row">
                          <span className="detail-label">Reason</span>
                          <p>{flag.reason}</p>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Order</span>
                          <p>#{ord?.id || flag.orderId}</p>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Notes</span>
                          <p>{flag.adminNotes || "No additional notes."}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
