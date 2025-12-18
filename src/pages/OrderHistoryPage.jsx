import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/OrderHistoryPage.css";

export default function OrderHistoryPage() {
  const navigate = useNavigate(); // <-- initialize navigate
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const statusColors = {
    New: "#FFA500",
    Accepted: "#1E90FF",
    Packed: "#6f42c1",
    Shipped: "#1E90FF",
    Delivered: "#28A745",
    Cancelled: "#DC3545",
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setServerError("");

      try {
        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/orders`);
        const data = await res.json();

        if (!res.ok) {
          setServerError(data.message || "Failed to fetch orders");
          setOrders([]);
        } else {
          setOrders(data);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
        setServerError("Network error. Please try again.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <>
      <Header />

      <div className="order-history-container">
        <h2 className="order-history-title">My Orders</h2>

        {/* Filters */}
        <div className="order-filters">
          {["All", "New", "Accepted", "Packed", "Shipped", "Delivered", "Cancelled"].map(
            (status) => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? "active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {loading ? (
            <p>Loading orders...</p>
          ) : serverError ? (
            <p className="form-error">{serverError}</p>
          ) : filteredOrders.length === 0 ? (
            <p className="no-orders">No orders found.</p>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="order-card"
                onClick={() => navigate(`/order-tracking/${order._id}`)} // <-- navigate on click
                style={{ cursor: "pointer" }}
              >
                <div className="order-header">
                  <span className="order-id">Order #{order.orderNo || order._id}</span>
                  <span
                    className="order-status"
                    style={{ backgroundColor: statusColors[order.status] }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <p>Date: {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : "N/A"}</p>
                  <p>Total: ${order.totalPrice}</p>
                  <p>
                    Items:{" "}
                    {order.items
                      .map((item) => `${item.name || "Item"} (x${item.quantity})`)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
