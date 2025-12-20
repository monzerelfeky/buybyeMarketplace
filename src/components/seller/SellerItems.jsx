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

  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // view + filters
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // image index per item id (for carousel)
  const [imageIndexById, setImageIndexById] = useState({});

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  /* -----------------------------
        EDIT HANDLERS
  ----------------------------- */
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleEditSave = (updated) => {
    // Support both id and _id
    const id = updated?._id || updated?.id;
    updateItem(id, updated);
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
        IMAGE HELPERS
  ----------------------------- */

  const resolveImageUrl = (img) => {
    if (!img) return null;

    // Cloudinary object: { url: "https://..." }
    if (typeof img === "object" && typeof img.url === "string") return img.url;

    // string formats
    if (typeof img !== "string") return null;

    // Full URL
    if (img.startsWith("http://") || img.startsWith("https://")) return img;

    // Base64 (legacy)
    if (img.startsWith("data:")) return img;

    // Local uploads served by backend
    if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;

    // Any other absolute path
    if (img.startsWith("/")) return `${API_BASE}${img}`;

    // Filename fallback
    return `${API_BASE}/uploads/images/${img}`;
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

    // Sort
    if (sortBy === "newest") {
      // Prefer createdAt (real Mongo), fallback to _id, fallback to id
      arr = [...arr].sort((a, b) => {
        const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (aT !== bT) return bT - aT;

        const aKey = String(a._id || a.id || "");
        const bKey = String(b._id || b.id || "");
        return bKey.localeCompare(aKey);
      });
    }
    if (sortBy === "price-low") {
      arr = [...arr].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }
    if (sortBy === "price-high") {
      arr = [...arr].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    if (sortBy === "az") {
      arr = [...arr].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
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
          {filteredItems.length === 0 && <p className="empty-state">No items found.</p>}

          {filteredItems.map((item) => {
            const itemId = item._id || item.id; // ✅ support both

            // ✅ Normalize images to URLs
            const images = Array.isArray(item.images)
              ? item.images
                  .map((img, idx) => {
                    const url = resolveImageUrl(img);
                    return url ? { id: `${itemId}-${idx}`, url } : null;
                  })
                  .filter(Boolean)
              : [];

            const hasImages = images.length > 0;

            const currentIndexRaw = imageIndexById[itemId] ?? 0;
            const safeIndex =
              currentIndexRaw >= 0 && currentIndexRaw < images.length ? currentIndexRaw : 0;

            const currentImage = hasImages ? images[safeIndex] : null;
            const imageSrc = currentImage?.url;

            const isActive =
              typeof item.isActive === "boolean"
                ? item.isActive
                : item.status === "active";

            return (
              <div
                key={itemId}
                className={`item-card ${view === "list" ? "list-view" : "grid-view"}`}
              >
                {/* Thumbnail / Carousel */}
                <div className="item-img-wrapper">
                  {hasImages && imageSrc ? (
                    <>
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="item-img thumb"
                        loading="lazy"
                        onError={(e) => {
                          console.error("Failed to load image:", imageSrc, "item:", item.title);
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="item-img-nav left"
                            onClick={() => stepImage(itemId, images.length, -1)}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="item-img-nav right"
                            onClick={() => stepImage(itemId, images.length, 1)}
                          >
                            ›
                          </button>

                          <div className="item-img-dots">
                            {images.map((img, idx) => (
                              <button
                                key={img.id || idx}
                                type="button"
                                className={`item-img-dot ${idx === safeIndex ? "active" : ""}`}
                                onClick={() => goToImage(itemId, idx)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="item-img thumb item-img-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-price">EGP {(Number(item.price) || 0).toLocaleString()}</p>

                  {view === "list" && (
                    <div className="item-status">
                      Status: {isActive ? "Active" : "Inactive"}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="item-right">
                  {view === "grid" && (
                    <div className="item-status">
                      Status: {isActive ? "Active" : "Inactive"}
                    </div>
                  )}

                  <div className="item-actions">
                    <button className="item-btn edit" onClick={() => handleEditClick(item)}>
                      Edit
                    </button>

                    <button className="item-btn deactivate" onClick={() => handleDeactivate(itemId)}>
                      {isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button className="item-btn delete" onClick={() => handleDelete(itemId)}>
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
      <UniversalModal isOpen={editOpen} onClose={() => setEditOpen(false)} type="create-item">
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
