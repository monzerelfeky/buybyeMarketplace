import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const getImageSrc = (img) => {
    if (!img || typeof img !== "string") return null;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("data:")) return img;
    if (img.includes("uploads/images/")) {
      const filename = img.split("uploads/images/").pop();
      return `${API_BASE}/uploads/images/${filename}`;
    }
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return `${API_BASE}/uploads/images/${img}`;
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
            cartItems.map((entry) => (
              <div className="cart-page-item" key={entry.itemId?._id || entry.itemId}>
                <img
                  src={getImageSrc(entry.itemId?.images?.[0]) || "https://via.placeholder.com/120"}
                  alt={entry.itemId?.title || "Item"}
                />
                <div className="cart-page-info">
                  <h3>{entry.itemId?.title || "Item"}</h3>
                  <p>
                    EGP {Number(entry.itemId?.price || 0).toLocaleString()} x {entry.quantity}
                  </p>
                </div>
              </div>
            ))
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


