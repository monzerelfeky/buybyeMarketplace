// src/components/SellerDashboard.jsx
import React from "react";
import Header from "../Header";
import Footer from "../Footer";

import { useSeller } from "../../context/SellerContext";

import "../../styles/seller/base.css";
import "../../styles/seller/layout.css";
import "../../styles/seller/buttons.css";
import "../../styles/seller/dashboard.css";

export default function SellerDashboard() {
  const { orders, items, flags } = useSeller();
  const { orders: _orders = [], items: _items = [], flags: _flags = [] } = { orders, items, flags };

  // Determine whether an item is active (supports new `isActive` boolean and legacy `status` string)
  const activeListings = _items.filter((it) => {
    if (!it) return false;
    if (typeof it.isActive === 'boolean') return it.isActive;
    return it.status === 'active';
  }).length;

  // Flags raised against this seller
  const flaggedItems = _flags.filter((f) => f.flaggedUserRole === 'buyer').length;

  // Normalize order status (supporting legacy and possible statusHistory)
  const normalizeStatus = (o) => {
    if (!o) return undefined;
    if (o.status) return o.status;
    if (Array.isArray(o.statusHistory) && o.statusHistory.length > 0) {
      const last = o.statusHistory[o.statusHistory.length - 1];
      return last && (last.status || last.state);
    }
    return undefined;
  };

  const pendingOrders = _orders.filter((o) => {
    const s = normalizeStatus(o);
    return ["New", "Accepted", "Packed", "Shipped"].includes(s);
  }).length;

  const deliveredOrders = _orders.filter((o) => {
    const s = normalizeStatus(o);
    return s === 'Delivered';
  });

  // Revenue: sum using priceAtOrder and quantity when available, otherwise fall back to price/qty
  const revenue = deliveredOrders.reduce((sum, order) => {
    const itemsList = Array.isArray(order.items) ? order.items : [];
    const orderTotal = itemsList.reduce((s, item) => {
      const price = (item && (item.priceAtOrder ?? item.price)) || 0;
      const qty = (item && (item.quantity ?? item.qty)) || 0;
      return s + price * qty;
    }, 0);
    return sum + orderTotal;
  }, 0);

  // Order breakdown using normalized status from fetched orders
  const breakdown = {
    New: _orders.filter((o) => normalizeStatus(o) === 'New').length,
    "In Progress": _orders.filter((o) => ['Accepted', 'Packed', 'Shipped'].includes(normalizeStatus(o))).length,
    Delivered: deliveredOrders.length,
    Cancelled: _orders.filter((o) => normalizeStatus(o) === 'Cancelled').length,
  };

  // Categories from items (use live items)
  const categoryCounts = _items.reduce((acc, it) => {
    const cat = it?.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const totalItems = _items.length || 0;
  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <div className="page-wrapper">
        <Header />

        <div className="seller-container dashboard-page">
          <div className="dash-header">
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">
              High-level overview of your performance
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">📦</span>
              </div>
              <h3 className="stat-value">{activeListings}</h3>
              <p className="stat-label">Active Listings</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">🛒</span>
                <span className="stat-badge">{breakdown.New} New</span>
              </div>
              <h3 className="stat-value">{pendingOrders}</h3>
              <p className="stat-label">Pending Orders</p>
            </div>

            <div className="stat-card warning">
              <div className="stat-header">
                <span className="stat-icon">⚠️</span>
              </div>
              <h3 className="stat-value">{flaggedItems}</h3>
              <p className="stat-label">Flags count</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon">💰</span>
              </div>
              <h3 className="stat-value">${revenue.toFixed(2)}</h3>
              <p className="stat-label">Revenue (delivered)</p>
            </div>
          </div>

          {/* Secondary analytics */}
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3 className="analytics-title">Order Breakdown</h3>
              <ul className="analytics-list">
                <li>
                  <span>New</span>
                  <strong>{breakdown.New}</strong>
                </li>
                <li>
                  <span>In Progress</span>
                  <strong>{breakdown["In Progress"]}</strong>
                </li>
                <li>
                  <span>Delivered</span>
                  <strong>{breakdown.Delivered}</strong>
                </li>
                <li>
                  <span>Cancelled</span>
                  <strong>{breakdown.Cancelled}</strong>
                </li>
              </ul>
            </div>

            <div className="analytics-card">
              <h3 className="analytics-title">Top Categories</h3>
              <ul className="analytics-list">
                {categoryEntries.map(([name, count]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <strong>
                      {Math.round((count / items.length) * 100)}%
                    </strong>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
