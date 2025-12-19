// pages/Buyer/WishlistPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { getWishlist, removeFromWishlist } from "../../utils/wishlist";
import "../../styles/HomePage.css";
import "../../styles/Listings.css";
import "../../styles/Wishlist.css";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
    e.stopPropagation();
    try {
      await removeFromWishlist(itemId);
      setWishlistItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  return (
    <div className="homepage-container">
      <Header />

      {/* Spacer under fixed header */}
      <div className="header-spacer" />

      <section className="wishlist-section">
        <div className="wishlist-header-wrapper">
          <div className="wishlist-header">
            <div>
              <h1 className="wishlist-main-title">Your Wishlist</h1>
              {wishlistItems.length > 0 && (
                <p className="wishlist-count">
                  {wishlistItems.length}{" "}
                  {wishlistItems.length === 1 ? "item" : "items"} saved
                </p>
              )}
            </div>
            <Link to="/" className="wishlist-back-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
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
            <Link to="/" className="wishlist-empty-cta">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <article key={item._id} className="listing-card">
                <div className="listing-image">
                  <div className="image-placeholder">
                    {item.images?.[0] ? (
                      <img
                        src={`${API_BASE}${item.images[0]}`}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>

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
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
