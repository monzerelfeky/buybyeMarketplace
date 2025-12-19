// src/components/SellerItems.jsx
import React, { useState, useMemo } from "react";
import Header from "../Header";
import Footer from "../Footer";

import "../../styles/seller/items.css";
import "../../styles/seller/toggle.css";
import "../../styles/seller/base.css";
import "../../styles/seller/buttons.css";

import UniversalModal from "../popups/UniversalModal";
import EditItemContent from "../popups/EditItemContent";
import { useSeller } from "../../context/SellerContext";

export default function SellerItems() {
  const { items, updateItem, deleteItem, toggleItemStatus } = useSeller();
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // view + filters
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // image index per item id (for carousel)
  const [imageIndexById, setImageIndexById] = useState({});

  /* -----------------------------
        EDIT HANDLERS
  ----------------------------- */
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleEditSave = (updated) => {
    updateItem(updated.id, updated);
    setEditOpen(false);
  };

  const handleDeactivate = (itemId) => {
    toggleItemStatus(itemId);
  };

  const handleDelete = (itemId) => {
    if (window.confirm("Delete this item? This action cannot be undone.")) {
      deleteItem(itemId);
    }
  };

  /* -----------------------------
        IMAGE CAROUSEL HELPERS
  ----------------------------- */

  const stepImage = (itemId, imagesLength, delta) => {
    if (!imagesLength) return;

    setImageIndexById((prev) => {
      const current = prev[itemId] ?? 0;
      const next = (current + delta + imagesLength) % imagesLength;
      return { ...prev, [itemId]: next };
    });
  };

  const goToImage = (itemId, index) => {
    setImageIndexById((prev) => ({ ...prev, [itemId]: index }));
  };

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

  /* -----------------------------
        FILTER + SORT + SEARCH
  ----------------------------- */
  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();

    let arr = items.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const cat = item.category?.toLowerCase() || "";

      const matchesSearch = title.includes(term) || cat.includes(term);
      const matchesCategory = !category || item.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "newest") {
      arr = [...arr].sort((a, b) => b.id - a.id);
    }
    if (sortBy === "price-low") {
      arr = [...arr].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-high") {
      arr = [...arr].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "az") {
      arr = [...arr].sort((a, b) => a.title.localeCompare(b.title));
    }

    return arr;
  }, [items, search, category, sortBy]);

  return (
    <>
      <Header />

      <div className="page-container">

        {/* ============================
             TOP BAR: Search / Category / Sort / View
        ============================ */}
        <div className="items-top-bar">
          {/* Search */}
          <div className="items-search-box">
            <input
              type="text"
              className="items-search-input"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="items-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option>Electronics</option>
            <option>Home & Garden</option>
            <option>Fashion</option>
            <option>Sports</option>
            <option>Vehicles</option>
            <option>Other</option>
          </select>

          {/* Sort */}
          <select
            className="items-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="az">Name A–Z</option>
            <option value="price-low">Price Low → High</option>
            <option value="price-high">Price High → Low</option>
          </select>

          {/* View toggle */}
          <div className="view-toggle">
            <div
              className={`toggle-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
            >
              <div className="grid-icon">
                <div />
                <div />
                <div />
                <div />
              </div>
            </div>

            <div
              className={`toggle-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              <div className="list-icon">
                <div />
                <div />
                <div />
              </div>
            </div>
          </div>
        </div>

        {/* ============================
             ITEMS
        ============================ */}
        <div className={view === "grid" ? "items-grid" : "items-list"}>
          {filteredItems.length === 0 && (
            <p className="empty-state">No items found.</p>
          )}

          {filteredItems.map((item) => {
            // Display images from DB (images should be URLs or filenames)
            const images = (item.images && item.images.length > 0) 
              ? item.images.map((img, idx) => ({ id: idx, src: getImageSrc(img) }))
              : [];
            const hasImages = images.length > 0;
            const currentIndexRaw = imageIndexById[item.id] ?? 0;
            const safeIndex =
              currentIndexRaw >= 0 && currentIndexRaw < images.length
                ? currentIndexRaw
                : 0;
            const currentImage = hasImages ? images[safeIndex] : null;
            const imageSrc = currentImage?.src;

            return (
              <div
                key={item.id}
                className={`item-card ${
                  view === "list" ? "list-view" : "grid-view"
                }`}
              >
                {/* Thumbnail / Carousel */}
                <div className="item-img-wrapper">
                  {hasImages && imageSrc ? (
                    <>
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="item-img thumb"
                      />

                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="item-img-nav left"
                            onClick={() =>
                              stepImage(item.id, images.length, -1)
                            }
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="item-img-nav right"
                            onClick={() =>
                              stepImage(item.id, images.length, 1)
                            }
                          >
                            ›
                          </button>

                          <div className="item-img-dots">
                            {images.map((img, idx) => (
                              <button
                                key={img.id || idx}
                                type="button"
                                className={`item-img-dot ${
                                  idx === safeIndex ? "active" : ""
                                }`}
                                onClick={() => goToImage(item.id, idx)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    // Placeholder when no images
                    <div className="item-img thumb item-img-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-price">${(Number(item.price) || 0).toFixed(2)}</p>

                  {view === "list" && (
                    <div className="item-status">
                      Status: {(typeof item.isActive === 'boolean' ? (item.isActive ? 'Active' : 'Inactive') : (item.status === 'active' ? 'Active' : 'Inactive'))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="item-right">
                  {view === "grid" && (
                    <div className="item-status">
                      Status: {(typeof item.isActive === 'boolean' ? (item.isActive ? 'Active' : 'Inactive') : (item.status === 'active' ? 'Active' : 'Inactive'))}
                    </div>
                  )}

                  <div className="item-actions">
                    <button
                      className="item-btn edit"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="item-btn deactivate"
                      onClick={() => handleDeactivate(item.id)}
                    >
                      {(typeof item.isActive === 'boolean' ? (item.isActive ? 'Deactivate' : 'Activate') : (item.status === 'active' ? 'Deactivate' : 'Activate'))}
                    </button>

                    <button
                      className="item-btn delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDIT MODAL */}
      <UniversalModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        type="create-item"
      >
        {selectedItem && (
          <EditItemContent
            item={selectedItem}
            onClose={() => setEditOpen(false)}
            onSave={handleEditSave}
          />
        )}
      </UniversalModal>

      <Footer />
    </>
  );
}
