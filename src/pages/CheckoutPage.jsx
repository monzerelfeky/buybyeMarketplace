import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();

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

  const handlePlaceOrder = () => {
    if (!validateFields()) return;

    const orderData = {
      shipping,
      paymentMethod,
      items: [
        { name: "Product A", price: 25 },
        { name: "Product B", price: 15 }
      ],
      total: 40
    };

    navigate("/order-confirmation", { state: orderData });
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
                <span>Product A</span>
                <span>$25</span>
              </div>

              <div className="summary-item">
                <span>Product B</span>
                <span>$15</span>
              </div>

              <hr />

              <div className="summary-total">
                <strong>Total</strong>
                <strong>$40</strong>
              </div>

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
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
