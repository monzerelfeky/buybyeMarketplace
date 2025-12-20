// components/Listings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist,
  getLocalWishlist,
  addToLocalWishlist,
  removeFromLocalWishlist
} from "../utils/wishlist";
import "../styles/Listings.css";

export default function Listings({ items = [], title, variant = "" }) {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const navigate = useNavigate();

  // Set to true temporarily to verify image URLs in console
  const DEBUG_IMAGES = false;

  // Use real items if provided
  const displayItems = items.length > 0 ? items : [];

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setCurrentUserId(null);
      return;
    }
    try {
      const user = JSON.parse(stored);
      setCurrentUserId(user?.id || user?._id || null);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  // Fetch wishlist on mount
  useEffect(() => {
    async function fetchWishlist() {
      try {
        const token = localStorage.getItem("authToken");
        
        if (token) {
          // User is logged in - fetch from database
          setIsLoggedIn(true);
          const data = await getWishlist();
          setWishlistIds(data.map(item => item._id));
        } else {
          // User is guest - load from localStorage
          setIsLoggedIn(false);
          const localWishlist = getLocalWishlist();
          setWishlistIds(localWishlist);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        // Fallback to local storage if API fails
        const localWishlist = getLocalWishlist();
        setWishlistIds(localWishlist);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, []);

  const handleToggleWishlist = async (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("authToken");

    try {
      if (token) {
        if (wishlistIds.includes(itemId)) {
          await removeFromWishlist(itemId);
          setWishlistIds(wishlistIds.filter((id) => id !== itemId));
        } else {
          await addToWishlist(itemId);
          setWishlistIds([...wishlistIds, itemId]);
        }
      } else {
        if (wishlistIds.includes(itemId)) {
          removeFromLocalWishlist(itemId);
          setWishlistIds(wishlistIds.filter((id) => id !== itemId));
        } else {
          addToLocalWishlist(itemId);
          setWishlistIds([...wishlistIds, itemId]);
        }
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

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

  const isInWishlist = (itemId) => wishlistIds.includes(itemId);

  const sectionClassName = `listings-section${variant ? ` listings-${variant}` : ""}`;

  return (
    <section className={sectionClassName}>
      {title ? (
        <div className="listings-header">
          <h2 className="listings-title">{title}</h2>
          {!isLoggedIn && wishlistIds.length > 0 && (
  <p className="listings-header-guest-notice">
    Login to save your wishlist permanently
  </p>
)}
        </div>
      ) : null}

      <div className="listings-grid">
        {displayItems.filter((item) => {
          if (item?.isActive === false) return false;
          if (!currentUserId) return true;
          const sellerId = item?.seller || item?.sellerId || item?.ownerId || item?.userId;
          return String(sellerId) !== String(currentUserId);
        }).map((item) => {
          // ✅ Image helper: supports Cloudinary objects + legacy strings
          const getImageSrc = (img) => {
            if (!img) return null;

            // Cloudinary format: { url: "https://..." }
            if (typeof img === "object" && img.url && typeof img.url === "string") {
              return img.url;
            }

            // Legacy string formats
            if (typeof img !== "string") return null;

            // Full URL
            if (img.startsWith("http://") || img.startsWith("https://")) return img;

            // Base64
            if (img.startsWith("data:")) return img;

            // Backend uploads
            if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;

            // Starts with /
            if (img.startsWith("/")) return `${API_BASE}${img}`;

            // Filename fallback
            return `${API_BASE}/uploads/images/${img}`;
          };

          // ✅ Normalize images (supports item.images as array/object/string + item.image legacy)
          const rawImages = Array.isArray(item.images)
            ? item.images
            : item.images
            ? [item.images]
            : item.image
            ? [item.image]
            : [];

          // ✅ Final list of resolved URLs
          const itemImages = rawImages.map(getImageSrc).filter(Boolean);

          const currentIndex = currentImageIndex[item._id] || 0;
          const currentImage = itemImages.length > 0 ? itemImages[currentIndex] : null;
          const hasMultipleImages = itemImages.length > 1;

          if (DEBUG_IMAGES) {
            console.log("[Listing Images]", {
              title: item.title,
              rawImages: item.images,
              resolved: itemImages,
              currentImage,
            });
          }

          return (
            <article
              key={item._id}
              className="listing-card"
              onClick={() => navigate(`/product/${item._id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="listing-image">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${item.title} - Image ${currentIndex + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                      backgroundColor: "#f5f5f5",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      console.error("Image failed to load:", currentImage, "for item:", item.title);
                      e.currentTarget.style.display = "none";
                      const placeholder = e.currentTarget.parentElement.querySelector(".image-placeholder");
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

                {/* Image Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      className="image-nav-btn prev-btn"
                      onClick={(e) => handlePrevImage(item._id, itemImages.length, e)}
                      aria-label="Previous image"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button
                      className="image-nav-btn next-btn"
                      onClick={(e) => handleNextImage(item._id, itemImages.length, e)}
                      aria-label="Next image"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {hasMultipleImages && <div className="image-counter">{currentIndex + 1} / {itemImages.length}</div>}

                {/* Favorite Button */}
                <button
                  className={`favorite-heart-btn ${isInWishlist(item._id) ? "favorited" : ""}`}
                  onClick={(e) => handleToggleWishlist(item._id, e)}
                  disabled={loading}
                  aria-label={isInWishlist(item._id) ? "Remove from favorites" : "Add to favorites"}
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
                  <span className="listing-Category">{item.category || "Category"}</span>
                  <span className="listing-time">{item.deliveryEstimate || "Available"}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
