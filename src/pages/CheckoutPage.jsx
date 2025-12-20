import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const egyptGovernorates = [
    "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo",
    "Dakahlia", "Damietta", "Faiyum", "Gharbia", "Giza", "Ismailia",
    "Kafr El Sheikh", "Luxor", "Matrouh", "Minya", "Monufia", "New Valley",
    "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea",
    "Sharqia", "Sohag", "South Sinai", "Suez"
  ];

  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: ""
  });

  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const validateFields = () => {
    const newErrors = {};
    if (!shipping.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!shipping.address.trim()) newErrors.address = "Address is required.";
    if (!shipping.city.trim()) newErrors.city = "City is required.";
    if (!shipping.phone.trim()) newErrors.phone = "Phone number is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
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

  const handlePlaceOrder = async () => {
    if (!validateFields()) return;
    setOrderError("");

    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!token || !user?.id) {
      setOrderError("Please login to place an order.");
      return;
    }

    if (cartItems.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    try {
      const grouped = cartItems.reduce((acc, entry) => {
        const sellerId = entry.itemId?.seller;
        if (!sellerId) return acc;
        acc[sellerId] = acc[sellerId] || [];
        acc[sellerId].push({
          itemId: entry.itemId?._id || entry.itemId,
          quantity: entry.quantity,
        });
        return acc;
      }, {});

      const orders = [];
      for (const [sellerId, items] of Object.entries(grouped)) {
        const res = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            buyerId: user.id || user._id,
            sellerId,
            items,
            deliveryAddress: {
              city: shipping.city,
              addressLine1: shipping.address,
              addressLine2: "",
              postalCode: "",
            },
            buyerNotes: "",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Order failed");
        orders.push(data);
      }

      await fetch(`${API_BASE}/api/users/me/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const confirmationPayload = {
        orders,
        shipping,
        paymentMethod,
        total: totalPrice,
      };
      sessionStorage.setItem(
        "lastOrderConfirmation",
        JSON.stringify(confirmationPayload)
      );
      navigate("/order-confirmation", { state: confirmationPayload });
    } catch (err) {
      console.error("Order error:", err);
      setOrderError("Failed to place order. Please try again.");
    }
  };

  return (
    <>
      <Header />

      <div className="checkout-container">
        <h2 className="checkout-title">Checkout</h2>

        <div className="checkout-grid">

          {/* LEFT SIDE */}
          <div className="checkout-left">

            {/* SHIPPING ADDRESS */}
            <div className="checkout-card">
              <h3 className="checkout-section-title">Shipping Address</h3>

              <div className="input-group">
                <label>
                  Full Name <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  className={`checkout-input ${errors.fullName ? "input-error" : ""}`}
                  value={shipping.fullName}
                  onChange={(e) =>
                    setShipping({ ...shipping, fullName: e.target.value })
                  }
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>

              <div className="input-group">
                <label>
                  Address <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  className={`checkout-input ${errors.address ? "input-error" : ""}`}
                  value={shipping.address}
                  onChange={(e) =>
                    setShipping({ ...shipping, address: e.target.value })
                  }
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="input-group city">
                <label>
                  City <span className="required-asterisk">*</span>
                </label>
                <select
                  className={`checkout-input ${errors.city ? "input-error" : ""}`}
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping({ ...shipping, city: e.target.value })
                  }
                >
                  <option value="">Select a city</option>
                  {egyptGovernorates.map((gov, index) => (
                    <option key={index} value={gov}>{gov}</option>
                  ))}
                </select>
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>

              <div className="input-group">
                <label>
                  Phone <span className="required-asterisk">*</span>
                </label>
                <input
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className={`checkout-input ${errors.phone ? "input-error" : ""}`}
                  value={shipping.phone}
                  onChange={(e) =>
                    setShipping({ ...shipping, phone: e.target.value.replace(/\D/, "") })
                  }
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="checkout-card">
              <h3 className="checkout-section-title">Payment Method</h3>

              <label className="payment-option">
                <input
                  type="radio"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                Cash on Delivery
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                Credit / Debit Card
              </label>
            </div>
          </div>

          {/* RIGHT SIDE ORDER SUMMARY */}
          <div className="checkout-right">
            <div className="checkout-card">
              <h3 className="checkout-section-title">Order Summary</h3>

              <div className="summary-item">
                <span>Items</span>
                <span>{cartItems.length}</span>
              </div>

              <hr />

              <div className="summary-total">
                <strong>Total</strong>
                <strong>EGP {Number(totalPrice || 0).toLocaleString()}</strong>
              </div>

              {orderError ? <p className="form-error">{orderError}</p> : null}

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
              >
                Place Order
              </button>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
