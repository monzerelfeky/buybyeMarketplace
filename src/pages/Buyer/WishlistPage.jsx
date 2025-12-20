// pages/Buyer/WishlistPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { 
  getWishlist, 
  removeFromWishlist,
  getLocalWishlist,
  removeFromLocalWishlist 
} from "../../utils/wishlist";
import "../../styles/HomePage.css";
import "../../styles/Listings.css";   // ✅ important: brings image-nav-btn styles
import "../../styles/Wishlist.css";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const navigate = useNavigate();

  // ✅ Same approach as Listings.jsx
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // { [itemId]: number }

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const fetchWishlist = async () => {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      setIsLoggedIn(true);
      try {
        const data = await getWishlist();
        setWishlistItems(data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setIsLoggedIn(false);
      try {
        const localIds = getLocalWishlist();
        
        if (localIds.length > 0) {
          const itemPromises = localIds.map(id =>
            fetch(`${API_BASE}/api/items/${id}`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          );
          const items = await Promise.all(itemPromises);
          setWishlistItems(items.filter(item => item && item._id));
        } else {
          setWishlistItems([]);
        }
      } catch (err) {
        console.error("Failed to fetch local wishlist items:", err);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
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
    
    const token = localStorage.getItem("authToken");
    
    try {
      if (token) {
        await removeFromWishlist(itemId);
      } else {
        removeFromLocalWishlist(itemId);
      }
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

  const getImages = (item) => {
    const rawImages = Array.isArray(item?.images)
      ? item.images
      : item?.images
      ? [item.images]
      : item?.image
      ? [item.image]
      : [];
    return rawImages
      .map((img) => {
        if (!img) return null;
        if (typeof img === "object" && typeof img.url === "string") return img.url;
        if (typeof img !== "string") return null;
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        if (img.startsWith("data:")) return img;
        if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;
        if (img.startsWith("/")) return `${API_BASE}${img}`;
        return `${API_BASE}/uploads/images/${img}`;
      })
      .filter(Boolean);
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

  if (loading) {
    return (
      <div className="wishlist-page">
        <Header />
        <div className="header-spacer" />
        <div className="wishlist-loading">
          <div className="wishlist-loading-spinner"></div>
          <p>Loading wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

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
              {!isLoggedIn && wishlistItems.length > 0 && (
                <p className="wishlist-header-guest-notice">
                  Login to sync your wishlist across devices
                </p>
              )}
            </div>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
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
            {!isLoggedIn && (
              <p className="wishlist-empty-guest-notice">
                💡 Items you add will be saved temporarily. Login to keep them forever!
              </p>
            )}
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const itemImages = getImages(item);
              const currentIndex = currentImageIndex[item._id] || 0;
              const currentImage =
                itemImages.length > 0 ? itemImages[currentIndex] : null;
              const hasMultipleImages = itemImages.length > 1;
              return (
                <article
                  key={item._id}
                  className="listing-card"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="listing-image">
                    {currentImage && (
                      <img
                        src={currentImage}
                        alt={item.title}
                        className="listing-image-element"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const placeholder = e.target.parentElement.querySelector(".image-placeholder");
                          if (placeholder) placeholder.classList.remove("image-placeholder-hidden");
                        }}
                      />
                    )}
                    <div className={`image-placeholder ${currentImage ? "image-placeholder-hidden" : "image-placeholder-visible"}`}>
                      No Image
                    </div>

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
                        <div className="image-counter">
                          {currentIndex + 1} / {itemImages.length}
                        </div>
                      </>
                    )}

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
                    <p className="listing-price">
                      EGP {Number(item.price || 0).toLocaleString()}
                    </p>
                    <div className="listing-meta">
                      <span className="listing-location">
                        {item.category || "Category"}
                      </span>
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
