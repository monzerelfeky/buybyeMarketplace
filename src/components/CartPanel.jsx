import React, { useEffect, useMemo, useState } from "react";
import "../styles/CartPanel.css";
import { useNavigate } from "react-router-dom";

export default function CartPanel({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [qtyInputs, setQtyInputs] = useState({});
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
                cartItems.map((entry) => {
                    const maxQty = entry.itemId?.quantity ?? Infinity;
                    const isMaxed = Number.isFinite(maxQty) && entry.quantity >= maxQty;
                    const itemKey = entry.itemId?._id || entry.itemId;
                    return (
                    <div className="cart-panel-item" key={itemKey}>
                        <img
                            src={getImageSrc(entry.itemId?.images?.[0]) || "https://via.placeholder.com/80"}
                            alt={entry.itemId?.title || "Item"}
                        />
                        <div className="cart-item-info">
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
