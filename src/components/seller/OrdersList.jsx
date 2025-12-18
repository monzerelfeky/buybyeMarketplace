// src/components/OrdersList.jsx
import React, { useState } from "react";
import Header from "../Header";
import Footer from "../Footer";

import UniversalModal from "../popups/UniversalModal";
import OrderDetail from "./OrderDetail";

import { useSeller } from "../../context/SellerContext";

import "../../styles/seller/base.css";
import "../../styles/seller/layout.css";
import "../../styles/seller/buttons.css";
import "../../styles/seller/orders.css";

export default function OrdersList() {
  const { orders, updateOrder } = useSeller();

  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [toasts, setToasts] = useState([]);

  const selectedOrder =
    orders.find((o) => o.id === selectedOrderId) || null;

  // SIMPLE TOAST SYSTEM
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleOpenModal = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenOrderModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "#f59e0b",
      Accepted: "#10b981",
      Packed: "#3b82f6",
      Shipped: "#8b5cf6",
      Delivered: "#059669",
      Cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  // Filter + Sort
  const filteredAndSortedOrders = (() => {
    const term = search.toLowerCase();

    let list = orders.filter((order) => {
      const buyerName = order.buyerName || order.buyer?.name || 'Unknown';
      const buyerId = order.buyerId?.toString?.() || order.buyerId || '';
      const matchesSearch =
        buyerId.includes(term) ||
        buyerName.toLowerCase().includes(term);

      const matchesStatus = !filterStatus || order.status === filterStatus;

      return matchesSearch && matchesStatus;
    });

    list = [...list].sort((a, b) => {
      const totalA = a.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
      const totalB = b.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );

      if (sortBy === "newest") {
        return b.id - a.id;
      }
      if (sortBy === "buyer") {
        const aName = a.buyer?.name || a.buyerName || '';
        const bName = b.buyer?.name || b.buyerName || '';
        return aName.localeCompare(bName);
      }
      if (sortBy === "total-high") {
        return totalB - totalA;
      }
      if (sortBy === "total-low") {
        return totalA - totalB;
      }
      return 0;
    });

    return list;
  })();

  return (
    <>
      <Header />

      <div className="page-container seller-orders-page">

        {/* Top Bar */}
        <div className="seller-orders-top-bar">
          <div className="seller-search-wrapper">
            <input
              type="text"
              className="seller-search-input"
              placeholder="Search by order ID or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="seller-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option>New</option>
            <option>Accepted</option>
            <option>Packed</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

          <select
            className="seller-status-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="buyer">Sort: Buyer A–Z</option>
            <option value="total-high">Sort: Total (High→Low)</option>
            <option value="total-low">Sort: Total (Low→High)</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="seller-orders-list">
          {filteredAndSortedOrders.map((order) => {
            const total = typeof order.totalPrice === "number"
              ? order.totalPrice
              : (order.items || []).reduce(
                  (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || item.qty || 0),
                  0
                );

            return (
              <div key={order.id} className="seller-order-card">
                <div className="seller-order-main">
                  <div className="seller-order-info">
                    <h3 className="seller-order-id"># {order.id}</h3>
                    <p className="seller-order-buyer">{order.buyerName || order.buyer?.name || 'Unknown Buyer'}</p>
                    <p className="seller-order-date">{order.placedAt ? new Date(order.placedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>

                  <div className="seller-order-meta">
                    <span
                      className="seller-status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                    <p className="seller-order-total">${total.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  className="seller-view-btn"
                  onClick={() => handleOpenModal(order.id)}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>

        {filteredAndSortedOrders.length === 0 && (
          <div className="seller-empty-state">No matching orders.</div>
        )}
      </div>

      <Footer />

      {/* Toast container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      <UniversalModal
        isOpen={openOrderModal}
        onClose={() => setOpenOrderModal(false)}
        type="large"
      >
        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            onClose={() => setOpenOrderModal(false)}
            onUpdate={updateOrder}
            onNotify={showToast}
          />
        )}
      </UniversalModal>
    </>
  );
}
