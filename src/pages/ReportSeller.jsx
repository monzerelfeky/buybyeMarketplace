import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ReportSeller.css";

export default function ReportSellerPage() {
  const { orderId } = useParams();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [flaggedItems, setFlaggedItems] = useState(new Set());
  const [flagError, setFlagError] = useState("");

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

    if (orderId) fetchOrder();
  }, [orderId]);

  const products = order?.items || [];

  const getProductId = (product) =>
    String(
      product?.itemId?._id ||
      product?.itemId ||
      product?._id ||
      product?.id ||
      product?.name
    );

  // Single-select toggle
  const selectProduct = (id) => {
    const productId = String(id);
    if (flaggedItems.has(productId)) {
      setFlagError("This product has already been flagged for this order.");
      return;
    }
    setFlagError("");
    setSelectedProducts([productId]);
  };

  // Get selected product info
  const selectedProduct = products.find((p) =>
    selectedProducts.includes(getProductId(p))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProducts.length || !details.trim()) {
      alert("Please select a product and describe the issue.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to submit a report.");
      return;
    }

    try {
      if (flaggedItems.has(selectedProducts[0])) {
        setFlagError("This product has already been flagged for this order.");
        return;
      }

      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/flags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          itemId: selectedProducts[0],
          flaggedUserRole: "seller",
          reason: details,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setFlagError("This product has already been flagged for this order.");
          return;
        }
        throw new Error(data.message || "Report failed");
      }
      alert("Report submitted successfully.");
      setFlaggedItems((prev) => new Set([...prev, selectedProducts[0]]));
      setSelectedProducts([]);
      setDetails("");
      setEvidence(null);
      setFlagError("");
    } catch (err) {
      console.error("Report error:", err);
      alert("Failed to submit report.");
    }
  };

  useEffect(() => {
    const fetchFlags = async () => {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!token || !(user?.id || user?._id)) return;

      try {
        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
        const params = new URLSearchParams();
        params.set("orderId", orderId);
        params.set("createdByUserId", user.id || user._id);
        params.set("flaggedUserRole", "seller");
        const res = await fetch(`${API_BASE}/api/flags?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          const ids = new Set(
            data
              .map((f) => f.itemId?._id || f.itemId)
              .filter(Boolean)
              .map((id) => String(id))
          );
          setFlaggedItems(ids);
        }
      } catch (err) {
        console.error("Fetch flags error:", err);
      }
    };

    if (orderId) fetchFlags();
  }, [orderId]);

  return (
    <>
      <Header />

      <div className="report-page">
        {/* LEFT SIDE – PRODUCTS (single select) */}
        <div className="report-left">
          <h2>Select a product</h2>

          <div className="products-wrapper">
            {loading ? (
              <p>Loading order...</p>
            ) : serverError ? (
              <p className="form-error">{serverError}</p>
            ) : (
              products.map((p) => {
                const productId = getProductId(p);
                const isFlagged = flaggedItems.has(productId);
                return (
              <div
                key={productId}
                className={`product-card ${
                  selectedProducts.includes(productId) ? "selected" : ""
                } ${isFlagged ? "disabled" : ""}`}
                onClick={() => selectProduct(productId)}
              >
                <img src="https://via.placeholder.com/90" alt={p.name} />

                <div className="product-info">
                  <h4>{p.name}</h4>
                  <p>Quantity: {p.quantity}</p>
                  <p style={{ fontStyle: "italic", fontSize: "13px", color: "#555" }}>
                    Seller: {order?.sellerId || "Seller"}
                  </p>
                </div>

                <div className="product-price">${p.price}</div>
              </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT SIDE – REPORT FORM */}
        <div className="report-right">
          <h2>Report Seller</h2>

          {selectedProduct ? (
            <form className="report-form" onSubmit={handleSubmit} autoComplete="off">
              <p>
                <strong>Seller:</strong> {order?.sellerId || "Seller"}
              </p>

              <div className="form-group">
                <label className="form-label">
                  Describe the issue <span>*</span>
                </label>
                <textarea
                  placeholder="Explain the problem you faced with the selected product..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload evidence (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setEvidence(e.target.files[0])}
                />
              </div>

              {flagError ? <p className="form-error">{flagError}</p> : null}

              <button
                type="submit"
                className="submit-btn-report"
                disabled={!selectedProducts.length}
              >
               flag seller
              </button>
            </form>
          ) : (
            <p style={{ color: "#777", fontStyle: "italic" }}>
              Select a product from the left to report an issue.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
