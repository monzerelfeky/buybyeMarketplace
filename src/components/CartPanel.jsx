import React, { useEffect, useMemo, useState } from "react";
import "../styles/CartPanel.css";
import { useNavigate } from "react-router-dom";

export default function CartPanel({ isOpen, onClose }) {
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

        if (isOpen) fetchCart();
    }, [API_BASE, isOpen]);

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
        {/* BACKDROP */}
        <div className={`cart-backdrop ${isOpen ? "open" : ""}`} onClick={onClose} />

        {/* CART PANEL */}
        <div className={`cart-panel ${isOpen ? "open" : ""}`}>
            <div className="cart-panel-header">
            <h2>Your Cart</h2>
            <button className="cart-close-btn" onClick={onClose}>×</button>
            </div>

            <div className="cart-items-list">
            {loading ? (
                <div className="cart-panel-item">
                    <div className="cart-item-info">
                        <h3>Loading...</h3>
                    </div>
                </div>
            ) : cartItems.length === 0 ? (
                <div className="cart-panel-item">
                    <div className="cart-item-info">
                        <h3>Your cart is empty</h3>
                    </div>
                </div>
            ) : (
                cartItems.map((entry) => (
                    <div className="cart-panel-item" key={entry.itemId?._id || entry.itemId}>
                        <img
                            src={getImageSrc(entry.itemId?.images?.[0]) || "https://via.placeholder.com/80"}
                            alt={entry.itemId?.title || "Item"}
                        />
                        <div className="cart-item-info">
                            <h3>{entry.itemId?.title || "Item"}</h3>
                            <p>
                                EGP {Number(entry.itemId?.price || 0).toLocaleString()} x {entry.quantity}
                            </p>
                        </div>
                    </div>
                ))
            )}
            </div>

            <div className="cart-items-total">
                <h3>Total: EGP {Number(totalPrice || 0).toLocaleString()}</h3>
            </div>

            <div className="cart-panel-actions">
            <button className="view-cart-btn" 
            onClick={() => {
            onClose();
            navigate("/cart");
            }}
            >
                View Cart
            </button>
            <button className="checkout-btn" onClick={() => navigate("/checkout")}>Checkout</button>
            </div>
        </div>
        </>
    );
}
