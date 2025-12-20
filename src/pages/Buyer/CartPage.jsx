import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qtyInputs, setQtyInputs] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const getImages = (item) => {
    const rawImages = Array.isArray(item?.images)
      ? item.images
      : item?.images
      ? [item.images]
      : item?.image
      ? [item.image]
      : [];
    return rawImages
      .map((img) => {
        if (!img) return null;
        if (typeof img === "object" && typeof img.url === "string") return img.url;
        if (typeof img !== "string") return null;
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        if (img.startsWith("data:")) return img;
        if (img.includes("uploads/images/")) {
          const filename = img.split("uploads/images/").pop();
          return `${API_BASE}/uploads/images/${filename}`;
        }
        if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;
        if (img.startsWith("/")) return `${API_BASE}${img}`;
        return `${API_BASE}/uploads/images/${img}`;
      })
      .filter(Boolean);
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

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setCartItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/users/me/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCartItems(data);
      } catch (err) {
        console.error("Cart fetch error:", err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [API_BASE]);

  useEffect(() => {
    const next = {};
    cartItems.forEach((entry) => {
      const key = entry.itemId?._id || entry.itemId;
      next[key] = String(entry.quantity);
    });
    setQtyInputs(next);
  }, [cartItems]);

  const updateCartItem = async (itemId, quantity, maxQty) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const next = Math.max(1, Number(quantity) || 1);
    const capped = Number.isFinite(maxQty) ? Math.min(next, maxQty) : next;
    try {
      const res = await fetch(`${API_BASE}/api/users/me/cart`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, quantity: capped }),
      });
      if (!res.ok) throw new Error("Failed to update cart");
      const data = await res.json();
      setCartItems(data);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Cart update error:", err);
    }
  };

  const commitQty = (itemId, rawValue, maxQty) => {
    const parsed = Number(rawValue);
    const next = Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
    const capped = Number.isFinite(maxQty) ? Math.min(next, maxQty) : next;
    setQtyInputs((prev) => ({ ...prev, [itemId]: String(capped) }));
    updateCartItem(itemId, capped, maxQty);
  };

  const removeCartItem = async (itemId) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/me/cart/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove cart item");
      const data = await res.json();
      setCartItems(data);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Cart remove error:", err);
    }
  };

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, entry) => sum + (Number(entry.itemId?.price) || 0) * (entry.quantity || 0),
        0
      ),
    [cartItems]
  );

  return (
    <>
      <Header />

      <div className="cart-page">
        <h1>Your Cart</h1>

        <div className="cart-page-items">
          {loading ? (
            <div className="cart-page-item">
              <div className="cart-page-info">
                <h3>Loading...</h3>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-page-item">
              <div className="cart-page-info">
                <h3>Your cart is empty</h3>
              </div>
            </div>
          ) : (
            cartItems.map((entry) => {
              const maxQty = entry.itemId?.quantity ?? Infinity;
              const isMaxed = Number.isFinite(maxQty) && entry.quantity >= maxQty;
              const itemKey = entry.itemId?._id || entry.itemId;
              const itemImages = getImages(entry.itemId);
              const currentIndex = currentImageIndex[itemKey] || 0;
              const currentImage =
                itemImages.length > 0 ? itemImages[currentIndex] : null;
              const hasMultipleImages = itemImages.length > 1;
              return (
              <div className="cart-page-item" key={itemKey}>
                <div className="cart-item-image">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={entry.itemId?.title || "Item"}
                    />
                  ) : (
                    <div className="cart-image-placeholder">No Image</div>
                  )}

                  {hasMultipleImages && (
                    <>
                      <button
                        className="image-nav-btn prev-btn"
                        onClick={(e) => handlePrevImage(itemKey, itemImages.length, e)}
                        aria-label="Previous image"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <button
                        className="image-nav-btn next-btn"
                        onClick={(e) => handleNextImage(itemKey, itemImages.length, e)}
                        aria-label="Next image"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                      <div className="image-counter">
                        {currentIndex + 1} / {itemImages.length}
                      </div>
                    </>
                  )}
                </div>
                <div className="cart-page-info">
                  <h3>{entry.itemId?.title || "Item"}</h3>
                  <p>
                    EGP {Number(entry.itemId?.price || 0).toLocaleString()} x {entry.quantity}
                  </p>
                  <div className="cart-qty-controls">
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() =>
                        commitQty(itemKey, entry.quantity - 1, maxQty)
                      }
                      disabled={entry.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={Number.isFinite(maxQty) ? maxQty : undefined}
                      className="cart-qty-input"
                      value={qtyInputs[itemKey] ?? String(entry.quantity)}
                      onChange={(e) =>
                        setQtyInputs((prev) => ({ ...prev, [itemKey]: e.target.value }))
                      }
                      onBlur={(e) => commitQty(itemKey, e.target.value, maxQty)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() =>
                        commitQty(itemKey, entry.quantity + 1, maxQty)
                      }
                      disabled={isMaxed}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeCartItem(entry.itemId?._id || entry.itemId)}
                      aria-label="Remove item"
                    >
                     <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>

                    </button>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>

        <button
          className="cart-checkout-btn"
          onClick={() => navigate("/checkout")}
          disabled={cartItems.length === 0}
        >
          Checkout (EGP {Number(totalPrice || 0).toLocaleString()})
        </button>
      </div>

      <Footer />
    </>
  );
}
