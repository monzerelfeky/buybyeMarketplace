// components/Listings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, addToWishlist, removeFromWishlist } from "../utils/wishlist";
import "../styles/Listings.css";

export default function Listings({ items = [], title, variant = "" }) {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const navigate = useNavigate();

  

  // Use real items if provided, otherwise use mock data
  const displayItems = items.length > 0 ? items : mockListings;

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
        {displayItems.map((item) => (
          <article
            key={item._id}
            className="listing-card"
            onClick={() => navigate(`/product/${item._id}`)}
          >
            <div className="listing-image">
              <div className="image-placeholder">
                {item.images?.[0] ? (
                  <img 
                    src={`${API_BASE}${item.images[0]}`} 
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </div>

              {/* Favorite Button */}
              <button
                className={`favorite-heart-btn ${
                  isInWishlist(item._id) ? "favorited" : ""
                }`}
                onClick={(e) => handleToggleWishlist(item._id, e)}
                disabled={loading}
                aria-label={
                  isInWishlist(item._id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
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
                <span className="listing-location">
                  {item.category || "Category"}
                </span>
                <span className="listing-time">
                  {item.deliveryEstimate || "Available"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
