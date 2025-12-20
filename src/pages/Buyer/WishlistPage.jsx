// pages/Buyer/WishlistPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { getWishlist, removeFromWishlist } from "../../utils/wishlist";
import "../../styles/HomePage.css";
import "../../styles/Listings.css";   // ✅ important: brings image-nav-btn styles
import "../../styles/Wishlist.css";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Same approach as Listings.jsx
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // { [itemId]: number }

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const fetchWishlist = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getWishlist();
      setWishlistItems(data);

      // init per-item index
      setCurrentImageIndex((prev) => {
        const next = { ...prev };
        (data || []).forEach((it) => {
          if (next[it._id] === undefined) next[it._id] = 0;
        });
        return next;
      });
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    const handleAuthChanged = () => fetchWishlist();
    window.addEventListener("auth-changed", handleAuthChanged);
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, []);

  const handleRemove = async (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFromWishlist(itemId);
      setWishlistItems((prev) => prev.filter((item) => item._id !== itemId));
      setCurrentImageIndex((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  // ✅ Copied logic style from Listings.jsx
  const handlePrevImage = (itemId, imageCount, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : imageCount - 1,
    }));
  };

  const handleNextImage = (itemId, imageCount, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [itemId]: prev[itemId] < imageCount - 1 ? prev[itemId] + 1 : 0,
    }));
  };

  // ✅ Same image resolving logic as Listings.jsx (supports Cloudinary objects + legacy strings)
  const getImageSrc = (img) => {
    if (!img) return null;

    // Cloudinary: { url: "https://..." }
    if (typeof img === "object" && img.url && typeof img.url === "string") {
      return img.url;
    }

    if (typeof img !== "string") return null;

    // Full URL
    if (img.startsWith("http://") || img.startsWith("https://")) return img;

    // Base64 (older items might still have it)
    if (img.startsWith("data:")) return img;

    // Backend uploads paths
    if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;

    // Starts with /
    if (img.startsWith("/")) return `${API_BASE}${img}`;

    // Filename fallback
    return `${API_BASE}/uploads/images/${img}`;
  };

  // ✅ Normalize images list (supports array/object/string + legacy item.image)
  const getItemImages = (item) => {
    const rawImages = Array.isArray(item.images)
      ? item.images
      : item.images
      ? [item.images]
      : item.image
      ? [item.image]
      : [];

    return rawImages.map(getImageSrc).filter(Boolean);
  };

  return (
    <div className="wishlist-page">
      <Header />
      <div className="header-spacer" />

      <section className="wishlist-section">
        <div className="wishlist-header-wrapper">
          <div className="wishlist-header">
            <div>
              <h1 className="wishlist-main-title">Your Wishlist</h1>
              {wishlistItems.length > 0 && (
                <p className="wishlist-count">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
                </p>
              )}
            </div>
          </div>
        </div>

        {!loading && wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
            <p className="wishlist-empty-text">
              Start adding items you love to keep track of them easily.
            </p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const itemImages = getItemImages(item);
              const currentIndex = currentImageIndex[item._id] || 0;
              const currentImage = itemImages.length ? itemImages[currentIndex] : null;
              const hasMultipleImages = itemImages.length > 1;

              return (
                <article key={item._id} className="listing-card">
                  <div className="listing-image" style={{ position: "relative" }}>
                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt={`${item.title} - Image ${currentIndex + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",       // ✅ matches Listings
                          display: "block",
                          backgroundColor: "#f5f5f5", // ✅ matches Listings
                        }}
                        loading="lazy"
                        onError={(e) => {
                          console.error("Image failed to load:", currentImage, "for item:", item.title);
                          e.currentTarget.style.display = "none";
                          const placeholder =
                            e.currentTarget.parentElement.querySelector(".image-placeholder");
                          if (placeholder) placeholder.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div
                        className="image-placeholder"
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#e5e7eb",
                          color: "#9ca3af",
                          fontSize: "14px",
                        }}
                      >
                        No Image
                      </div>
                    )}

                    {/* ✅ Same arrows as Listings.jsx */}
                    {hasMultipleImages && (
                      <>
                        <button
                          className="image-nav-btn prev-btn"
                          onClick={(e) => handlePrevImage(item._id, itemImages.length, e)}
                          aria-label="Previous image"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button
                          className="image-nav-btn next-btn"
                          onClick={(e) => handleNextImage(item._id, itemImages.length, e)}
                          aria-label="Next image"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </>
                    )}

                    {/* ✅ Same counter as Listings.jsx */}
                    {hasMultipleImages && (
                      <div className="image-counter">
                        {currentIndex + 1} / {itemImages.length}
                      </div>
                    )}

                    {/* Heart remove button (same look you had) */}
                    <button
                      className="favorite-heart-btn favorited"
                      onClick={(e) => handleRemove(item._id, e)}
                      aria-label="Remove from favorites"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="heart-outline"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span className="heart-filled">💚</span>
                    </button>
                  </div>

                  <div className="listing-body">
                    <h3 className="listing-title">{item.title}</h3>
                    <p className="listing-price">EGP {Number(item.price || 0).toLocaleString()}</p>
                    <div className="listing-meta">
                      <span className="listing-location">{item.category || "Category"}</span>
                      <span className="listing-time">Saved item</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
