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
    "Alexandria",
    "Aswan",
    "Asyut",
    "Beheira",
    "Beni Suef",
    "Cairo",
    "Dakahlia",
    "Damietta",
    "Faiyum",
    "Gharbia",
    "Giza",
    "Ismailia",
    "Kafr El Sheikh",
    "Luxor",
    "Matrouh",
    "Minya",
    "Monufia",
    "New Valley",
    "North Sinai",
    "Port Said",
    "Qalyubia",
    "Qena",
    "Red Sea",
    "Sharqia",
    "Sohag",
    "South Sinai",
    "Suez",
  ];

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: ""
  });

  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState("");

  const validateFields = () => {
    const newErrors = {};
    if (!shipping.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!shipping.phone.trim()) newErrors.phone = "Phone number is required.";
    if (selectedAddressIndex === "") newErrors.address = "Please select an address.";

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
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const [profileRes, addressRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/users/me/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok) return;
        const profile = await profileRes.json();
        const addresses = addressRes.ok ? await addressRes.json() : [];
        const nextAddresses = Array.isArray(addresses) ? addresses : [];
        setSavedAddresses(nextAddresses);
        const primaryAddress =
          nextAddresses.find((addr) => addr.isDefault) || nextAddresses[0];
        if (primaryAddress) {
          const idx = nextAddresses.indexOf(primaryAddress);
          if (idx >= 0) setSelectedAddressIndex(String(idx));
        }

        setShipping((prev) => ({
          fullName: prev.fullName || profile?.name || "",
          phone: prev.phone || profile?.phone || "",
        }));
      } catch (err) {
        console.error("Failed to preload profile data:", err);
      }
    };

    fetchProfile();
  }, [API_BASE]);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressEditingIndex, setAddressEditingIndex] = useState(null);
  const emptyAddress = {
    label: "Home",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  };
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addressErrors, setAddressErrors] = useState({});
  const [addressSaving, setAddressSaving] = useState(false);

  const openAddressModal = () => {
    setIsAddressModalOpen(true);
    const isFirst = savedAddresses.length === 0;
    setAddressEditingIndex(isFirst ? -1 : null);
    setAddressForm({ ...emptyAddress, isDefault: isFirst });
    setAddressErrors({});
  };

  const mapAddressToForm = (addr) => ({
    label: addr?.label || "Home",
    addressLine1: addr?.addressLine1 || "",
    addressLine2: addr?.addressLine2 || "",
    city: addr?.city || "",
    state: addr?.state || "",
    postalCode: addr?.postalCode || "",
    country: addr?.country || "",
    isDefault: Boolean(addr?.isDefault),
  });

  const startEditAddress = (idx) => {
    setAddressEditingIndex(idx);
    setAddressForm(mapAddressToForm(savedAddresses[idx]));
    setAddressErrors({});
  };

  const startAddAddress = () => {
    setAddressEditingIndex(-1);
    setAddressForm({ ...emptyAddress, isDefault: savedAddresses.length === 0 });
    setAddressErrors({});
  };

  const validateAddressForm = () => {
    const errs = {};
    if (!addressForm.addressLine1.trim()) errs.addressLine1 = "Address line 1 required";
    if (!addressForm.city.trim()) errs.city = "City required";
    if (!addressForm.postalCode.trim()) errs.postalCode = "Postal code required";
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      setOrderError("Please login to save addresses.");
      return;
    }
    setAddressSaving(true);
    try {
      const isEdit = addressEditingIndex !== null && addressEditingIndex >= 0;
      const url = isEdit
        ? `${API_BASE}/api/users/me/addresses/${addressEditingIndex}`
        : `${API_BASE}/api/users/me/addresses`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: addressForm.label,
          addressLine1: addressForm.addressLine1,
          addressLine2: addressForm.addressLine2,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
          country: addressForm.country,
          isDefault: addressForm.isDefault,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");
      if (Array.isArray(data)) {
        setSavedAddresses(data);
        const defaultIndex = data.findIndex((addr) => addr.isDefault);
        const nextIndex = defaultIndex >= 0 ? defaultIndex : data.length - 1;
        setSelectedAddressIndex(String(nextIndex));
      }
      setAddressEditingIndex(null);
      setAddressForm({ ...emptyAddress, isDefault: savedAddresses.length === 0 });
      setAddressErrors({});
    } catch (err) {
      console.error("Save address error:", err);
      setOrderError("Failed to save address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSaveNewAddress = handleSaveAddress;

  const handleDeleteAddress = async (idx) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setOrderError("Please login to delete addresses.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/users/me/addresses/${idx}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete address");
      if (Array.isArray(data)) {
        setSavedAddresses(data);
        const defaultIndex = data.findIndex((addr) => addr.isDefault);
        setSelectedAddressIndex(
          defaultIndex >= 0 ? String(defaultIndex) : data.length ? "0" : ""
        );
      }
    } catch (err) {
      console.error("Delete address error:", err);
      setOrderError("Failed to delete address.");
    }
  };

  const handleSelectAddress = (idx) => {
    setSelectedAddressIndex(String(idx));
    setIsAddressModalOpen(false);
  };

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
      const selectedAddress =
        selectedAddressIndex !== "" &&
        savedAddresses[Number(selectedAddressIndex)]
          ? savedAddresses[Number(selectedAddressIndex)]
          : null;
      const deliveryAddress = {
        city: selectedAddress?.city || "",
        addressLine1: selectedAddress?.addressLine1 || "",
        addressLine2: selectedAddress?.addressLine2 || "",
        postalCode: selectedAddress?.postalCode || "",
        state: selectedAddress?.state || "",
        country: selectedAddress?.country || "",
      };

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
            deliveryAddress,
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
        shipping: {
          fullName: shipping.fullName,
          phone: shipping.phone,
          address: deliveryAddress.addressLine1,
          city: deliveryAddress.city,
          postalCode: deliveryAddress.postalCode,
        },
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

              <div className="checkout-address-row">
                <div className="checkout-address-card">
                  {selectedAddressIndex !== "" &&
                  savedAddresses[Number(selectedAddressIndex)] ? (
                    <>
                      <div className="address-card-label">
                        {savedAddresses[Number(selectedAddressIndex)].label || "Address"}
                      </div>
                      <div className="address-card-line">
                        {savedAddresses[Number(selectedAddressIndex)].addressLine1}
                      </div>
                      {savedAddresses[Number(selectedAddressIndex)].addressLine2 ? (
                        <div className="address-card-line">
                          {savedAddresses[Number(selectedAddressIndex)].addressLine2}
                        </div>
                      ) : null}
                      <div className="address-card-line">
                        {savedAddresses[Number(selectedAddressIndex)].city},{" "}
                        {savedAddresses[Number(selectedAddressIndex)].postalCode}
                      </div>
                    </>
                  ) : (
                    <div className="address-card-empty">
                      No address selected yet.
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="checkout-address-btn"
                  onClick={openAddressModal}
                >
                  {savedAddresses.length > 0 ? "Choose address" : "Add address"}
                </button>
              </div>
              {errors.address && <span className="error-text">{errors.address}</span>}

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
                <CardPaymentForm onPay={handlePlaceOrder} isSubmitting={isPlacingOrder} />
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

              <hr />

              <div className="summary-total">
                <strong>Total</strong>
                <strong>EGP {Number(totalPrice || 0).toLocaleString()}</strong>
              </div>

              {orderError ? <p className="form-error">{orderError}</p> : null}

              {paymentMethod === "cash" && (
                <button
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading || cartItems.length === 0 || isPlacingOrder}
                >
                  {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAddressModalOpen && (
        <div
          className="checkout-address-modal-backdrop"
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div
            className="checkout-address-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Choose address</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddressModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="address-modal-list">
              {savedAddresses.length === 0 && (
                <div className="address-modal-empty">
                  No saved addresses yet. Add one below.
                </div>
              )}

              {savedAddresses.map((addr, idx) => {
                const isEditing = addressEditingIndex === idx;
                return (
                  <div key={`${addr.label}-${idx}`} className="address-modal-card">
                    <div className="address-modal-card-main">
                      <div>
                        <div className="address-card-label">
                          {addr.label || "Address"}
                          {addr.isDefault && (
                            <span className="address-default-pill">Default</span>
                          )}
                        </div>
                        <div className="address-card-line">{addr.addressLine1}</div>
                        {addr.addressLine2 ? (
                          <div className="address-card-line">{addr.addressLine2}</div>
                        ) : null}
                        <div className="address-card-line">
                          {addr.city}, {addr.postalCode}
                        </div>
                      </div>
                      <div className="address-card-actions">
                        <button
                          type="button"
                          className="address-select-btn"
                          onClick={() => handleSelectAddress(idx)}
                        >
                          Use this
                        </button>
                        <button
                          type="button"
                          className="address-edit-btn"
                          onClick={() => startEditAddress(idx)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="address-delete-btn"
                          onClick={() => handleDeleteAddress(idx)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="address-form-card">
                        <div className="address-form-grid">
                          <label>
                            Label
                            <input
                              className="checkout-input"
                              value={addressForm.label}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  label: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <label>
                            Address line 1
                            <input
                              className="checkout-input"
                              value={addressForm.addressLine1}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  addressLine1: e.target.value,
                                }))
                              }
                            />
                            {addressErrors.addressLine1 && (
                              <span className="error-text">
                                {addressErrors.addressLine1}
                              </span>
                            )}
                          </label>
                          <label>
                            Address line 2
                            <input
                              className="checkout-input"
                              value={addressForm.addressLine2}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  addressLine2: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <label>
                            City
                            <select
                              className="checkout-input"
                              value={addressForm.city}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  city: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select a city</option>
                              {egyptGovernorates.map((gov) => (
                                <option key={gov} value={gov}>
                                  {gov}
                                </option>
                              ))}
                            </select>
                            {addressErrors.city && (
                              <span className="error-text">
                                {addressErrors.city}
                              </span>
                            )}
                          </label>
                          <label>
                            Postal code
                            <input
                              className="checkout-input"
                              value={addressForm.postalCode}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  postalCode: e.target.value,
                                }))
                              }
                            />
                            {addressErrors.postalCode && (
                              <span className="error-text">
                                {addressErrors.postalCode}
                              </span>
                            )}
                          </label>
                          <label className="address-checkbox">
                            <input
                              type="checkbox"
                              checked={addressForm.isDefault}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  isDefault: e.target.checked,
                                }))
                              }
                            />
                            Set as default
                          </label>
                        </div>
                        <div className="address-form-actions">
                          <button
                            type="button"
                            className="address-save-btn"
                            onClick={handleSaveAddress}
                            disabled={addressSaving}
                          >
                            {addressSaving ? "Saving..." : "Save changes"}
                          </button>
                          <button
                            type="button"
                            className="address-cancel-btn"
                            onClick={() => {
                              setAddressEditingIndex(null);
                              setAddressErrors({});
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="address-add-section">
              <div className="address-add-header">
                <h4>Add new address</h4>
                <button
                  type="button"
                  className="address-add-btn"
                  onClick={startAddAddress}
                >
                  Add address
                </button>
              </div>

              {addressEditingIndex === -1 && (
                <div className="address-form-card">
                  <div className="address-form-grid">
                    <label>
                      Label
                      <input
                        className="checkout-input"
                        value={addressForm.label}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            label: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      Address line 1
                      <input
                        className="checkout-input"
                        value={addressForm.addressLine1}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            addressLine1: e.target.value,
                          }))
                        }
                      />
                      {addressErrors.addressLine1 && (
                        <span className="error-text">
                          {addressErrors.addressLine1}
                        </span>
                      )}
                    </label>
                    <label>
                      Address line 2
                      <input
                        className="checkout-input"
                        value={addressForm.addressLine2}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            addressLine2: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      City
                      <select
                        className="checkout-input"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select a city</option>
                        {egyptGovernorates.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                      {addressErrors.city && (
                        <span className="error-text">{addressErrors.city}</span>
                      )}
                    </label>
                    <label>
                      Postal code
                      <input
                        className="checkout-input"
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            postalCode: e.target.value,
                          }))
                        }
                      />
                      {addressErrors.postalCode && (
                        <span className="error-text">
                          {addressErrors.postalCode}
                        </span>
                      )}
                    </label>
                    <label className="address-checkbox">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            isDefault: e.target.checked,
                          }))
                        }
                      />
                      Set as default
                    </label>
                  </div>
                  <div className="address-form-actions">
                    <button
                      type="button"
                      className="address-save-btn"
                      onClick={handleSaveAddress}
                      disabled={addressSaving}
                    >
                      {addressSaving ? "Saving..." : "Save address"}
                    </button>
                    <button
                      type="button"
                      className="address-cancel-btn"
                      onClick={() => {
                        setAddressEditingIndex(null);
                        setAddressErrors({});
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

      

