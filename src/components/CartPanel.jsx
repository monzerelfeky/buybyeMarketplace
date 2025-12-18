import React from "react";
import "../styles/CartPanel.css";
import { useNavigate } from "react-router-dom";

export default function CartPanel({ isOpen, onClose }) {
    const navigate = useNavigate();

    const dummyCartItems = [
        {
        id: 1,
        name: "Sample Product",
        price: 120,
        image: "https://via.placeholder.com/80",
        },
        {
        id: 2,
        name: "Another Product",
        price: 90,
        image: "https://via.placeholder.com/80",
        },
        {
        id:3,
        name: "Third Product",
        price: 55,
        image: "https://via.placeholder.com/80"
        }
    ];

    const totalPrice = dummyCartItems.reduce((sum, item) => sum + item.price, 0);


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
            {dummyCartItems.map((item) => (
                <div className="cart-panel-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>${item.price}</p>
                </div>
                </div>
            ))}
            </div>

            <div className="cart-items-total">
                <h3>Total: ${totalPrice}</h3>
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