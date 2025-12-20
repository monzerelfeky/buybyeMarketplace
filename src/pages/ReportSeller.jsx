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
  const [currentImageIndex, setCurrentImageIndex] = useState({});

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

  const resolveImageUrl = (img) => {
    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
    if (!img) return null;
    if (typeof img === "object" && typeof img.url === "string") return img.url;
    if (typeof img !== "string") return null;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("data:")) return img;
    if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return `${API_BASE}/uploads/images/${img}`;
  };

  const getProductImage = (product) => {
    const rawImages = Array.isArray(product?.images)
      ? product.images
      : product?.images
      ? [product.images]
      : product?.image
      ? [product.image]
      : product?.itemId?.images
      ? Array.isArray(product.itemId.images)
        ? product.itemId.images
        : [product.itemId.images]
      : product?.itemId?.image
      ? [product.itemId.image]
      : [];
    return rawImages.map(resolveImageUrl).filter(Boolean)[0] || null;
  };

  const getProductImages = (product) => {
    const rawImages = Array.isArray(product?.images)
      ? product.images
      : product?.images
      ? [product.images]
      : product?.image
      ? [product.image]
      : product?.itemId?.images
      ? Array.isArray(product.itemId.images)
        ? product.itemId.images
        : [product.itemId.images]
      : product?.itemId?.image
      ? [product.itemId.image]
      : [];
    return rawImages.map(resolveImageUrl).filter(Boolean);
  };

  const handlePrevImage = (itemId, imageCount, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : imageCount - 1,
    }));
  };

  const handleNextImage = (itemId, imageCount, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [itemId]: prev[itemId] < imageCount - 1 ? prev[itemId] + 1 : 0,
    }));
  };

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
                const images = getProductImages(p);
                const currentIndex = currentImageIndex[productId] || 0;
                const currentImage =
                  images.length > 0 ? images[currentIndex] : null;
                const hasMultipleImages = images.length > 1;
                return (
              <div
                key={productId}
                className={`product-card ${
                  selectedProducts.includes(productId) ? "selected" : ""
                } ${isFlagged ? "disabled" : ""}`}
                onClick={() => selectProduct(productId)}
              >
                <div className="product-image">
                  {currentImage ? (
                    <img src={currentImage} alt={p.name} />
                  ) : (
                    <div className="product-image-placeholder">No Image</div>
                  )}

                  {hasMultipleImages && (
                    <>
                      <button
                        className="image-nav-btn prev-btn"
                        onClick={(e) => handlePrevImage(productId, images.length, e)}
                        aria-label="Previous image"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <button
                        className="image-nav-btn next-btn"
                        onClick={(e) => handleNextImage(productId, images.length, e)}
                        aria-label="Next image"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                      <div className="image-counter">
                        {currentIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

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
