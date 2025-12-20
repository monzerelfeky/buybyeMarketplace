import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import CardPaymentForm from "../components/Checkout/CardPaymentForm";
import "../styles/CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
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
  const [serviceabilityStatus, setServiceabilityStatus] = useState({
    state: "idle",
    blocked: [],
    details: [],
    feeTotal: 0,
  });

  const normalizeCity = (value) => String(value || "").trim().toLowerCase();

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

  useEffect(() => {
    const city = normalizeCity(shipping.city);
    const sellerIds = Array.from(
      new Set(cartItems.map((entry) => entry.itemId?.seller).filter(Boolean))
    );

    if (!city || sellerIds.length === 0) {
      setServiceabilityStatus({ state: "idle", blocked: [], details: [], feeTotal: 0 });
      return;
    }

    let cancelled = false;
    setServiceabilityStatus((prev) => ({ ...prev, state: "checking" }));

    const fetchServiceability = async () => {
      try {
        const results = await Promise.all(
          sellerIds.map(async (sellerId) => {
            const res = await fetch(`${API_BASE}/api/sellers/${sellerId}/service-areas`);
            if (!res.ok) {
              return { sellerId, allowed: false, reason: "Seller not found" };
            }
            const areas = await res.json();
            if (!Array.isArray(areas) || areas.length === 0) {
              return { sellerId, allowed: true, reason: "No service area limits", fee: 0 };
            }
            const match = areas.find((area) => normalizeCity(area.city) === city);
            return {
              sellerId,
              allowed: Boolean(match),
              reason: match ? "Covered" : "City not covered",
              fee: match ? Number(match.deliveryFee || 0) : 0,
            };
          })
        );

        if (cancelled) return;
        const blocked = results.filter((r) => !r.allowed).map((r) => r.sellerId);
        const feeTotal = results.reduce((sum, r) => sum + (Number(r.fee) || 0), 0);
        setServiceabilityStatus({
          state: blocked.length ? "blocked" : "ok",
          blocked,
          details: results,
          feeTotal,
        });
      } catch (err) {
        if (cancelled) return;
        setServiceabilityStatus({ state: "blocked", blocked: sellerIds, details: [], feeTotal: 0 });
      }
    };

    fetchServiceability();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, cartItems, shipping.city]);

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, entry) => sum + (Number(entry.itemId?.price) || 0) * (entry.quantity || 0),
        0
      ),
    [cartItems]
  );
  const deliveryFeeTotal = serviceabilityStatus.feeTotal || 0;
  const grandTotal = totalPrice + deliveryFeeTotal;

  const handlePlaceOrder = async () => {
    if (!validateFields()) return;
    setOrderError("");
    setIsPlacingOrder(true);

    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!token || !user?.id) {
      setOrderError("Please login to place an order.");
      setIsPlacingOrder(false);
      return;
    }

    if (cartItems.length === 0) {
      setOrderError("Your cart is empty.");
      setIsPlacingOrder(false);
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
        deliveryFee: serviceabilityStatus.feeTotal,
        total: totalPrice + serviceabilityStatus.feeTotal,
      };
      sessionStorage.setItem(
        "lastOrderConfirmation",
        JSON.stringify(confirmationPayload)
      );
      navigate("/order-confirmation", { state: confirmationPayload });
    } catch (err) {
      console.error("Order error:", err);
      setOrderError("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
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

              {paymentMethod === "card" && (
                <CardPaymentForm
                  onPay={handlePlaceOrder}
                  isSubmitting={isPlacingOrder}
                  disabledReason={
                    serviceabilityStatus.state === "blocked"
                      ? "Delivery is not available for the selected city."
                      : ""
                  }
                />
              )}

              {serviceabilityStatus.state !== "idle" && (
                <div className="serviceability-status">
                  <p className="serviceability-title">Delivery availability</p>
                  {serviceabilityStatus.state === "checking" && (
                    <p className="serviceability-note">Checking coverage...</p>
                  )}
                  {serviceabilityStatus.state === "ok" && (
                    <p className="serviceability-ok">Delivery available for the selected city.</p>
                  )}
                  {serviceabilityStatus.state === "blocked" && (
                    <div className="serviceability-blocked">
                      <p>Delivery not available for one or more sellers.</p>
                      <ul>
                        {serviceabilityStatus.details.map((detail) => (
                          <li key={detail.sellerId}>
                            Seller {detail.sellerId.slice(-6)}: {detail.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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

              <div className="summary-item">
                <span>Delivery fee</span>
                <span>EGP {Number(deliveryFeeTotal || 0).toLocaleString()}</span>
              </div>

              <hr />

              <div className="summary-total">
                <strong>Total</strong>
                <strong>EGP {Number(grandTotal || 0).toLocaleString()}</strong>
              </div>

              {orderError ? <p className="form-error">{orderError}</p> : null}

              {paymentMethod === "cash" && (
                <button
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={
                    loading ||
                    cartItems.length === 0 ||
                    isPlacingOrder ||
                    serviceabilityStatus.state === "blocked"
                  }
                >
                  {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
