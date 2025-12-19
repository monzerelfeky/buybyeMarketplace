// components/Listings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, addToWishlist, removeFromWishlist } from "../utils/wishlist";
import "../styles/Listings.css";

export default function Listings({ items = [], title, variant = "" }) {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const navigate = useNavigate();

  // Use real items if provided
  const displayItems = items.length > 0 ? items : [];

  // Fetch wishlist on mount
  useEffect(() => {
    async function fetchWishlist() {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await getWishlist();
        setWishlistIds(data.map(item => item._id));
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
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
    if (!token) {
      alert("Please login to use wishlist");
      return;
    }

    try {
      if (wishlistIds.includes(itemId)) {
        await removeFromWishlist(itemId);
        setWishlistIds(wishlistIds.filter(id => id !== itemId));
      } else {
        await addToWishlist(itemId);
        setWishlistIds([...wishlistIds, itemId]);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const handlePrevImage = (itemId, imageCount, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : imageCount - 1
    }));
  };

  const handleNextImage = (itemId, imageCount, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [itemId]: prev[itemId] < imageCount - 1 ? prev[itemId] + 1 : 0
    }));
  };

  const isInWishlist = (itemId) => wishlistIds.includes(itemId);

  const sectionClassName = `listings-section${variant ? ` listings-${variant}` : ""}`;

  return (
    <section className={sectionClassName}>
      {title ? (
        <div className="listings-header">
          <h2 className="listings-title">{title}</h2>
        </div>
      ) : null}

      <div className="listings-grid">
        {displayItems.map((item) => {
          // Process images array
          const getImageSrc = (img) => {
            if (!img || typeof img !== 'string') return null;

            // If it's already a full URL (http/https), use as-is
            if (img.startsWith('http://') || img.startsWith('https://')) {
              return img;
            }

            // If it's a base64 data URL, use as-is
            if (img.startsWith('data:')) {
              return img;
            }

            // Handle file paths and filenames
            if (img.startsWith('/uploads/')) {
              return `${API_BASE}${img}`;
            }

            // If it's a filename with extension
            const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(img);
            if (hasImageExtension || !img.includes('/')) {
              return `${API_BASE}/uploads/images/${img}`;
            }

            // If it starts with /
            if (img.startsWith('/')) {
              return `${API_BASE}${img}`;
            }

            // Default: treat as filename
            return `${API_BASE}/uploads/images/${img}`;
          };

          const itemImages = item.images && Array.isArray(item.images) ? item.images : [];
          const currentIndex = currentImageIndex[item._id] || 0;
          const currentImage = itemImages.length > 0 ? getImageSrc(itemImages[currentIndex]) : null;
          const hasMultipleImages = itemImages.length > 1;

          return (
            <article key={item._id} className="listing-card">
              <div className="listing-image">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${item.title} - Image ${currentIndex + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      backgroundColor: '#f5f5f5'
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', currentImage, 'for item:', item.title);
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="image-placeholder" style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e5e7eb',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
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
                {hasMultipleImages && (
                  <div className="image-counter">
                    {currentIndex + 1} / {itemImages.length}
                  </div>
                )}

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
                <p className="listing-price">EGP {item.price.toLocaleString()}</p>
                <div className="listing-meta">
                  <span className="listing-Category">
                    {item.category || "Category"}
                  </span>
                  <span className="listing-time">
                    {item.deliveryEstimate || "Available"}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}