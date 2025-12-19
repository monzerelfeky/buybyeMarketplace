// pages/Buyer/WishlistPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "../../styles/HomePage.css";
import "../../styles/Listings.css";
import "../../styles/Wishlist.css";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../utils/wishlist";

export default function WishlistPage() {
  // State
  const [favorites, setFavorites] = useState({}); // Map of itemId => true
  const [loading, setLoading] = useState(true);

  // Helpers for guest wishlist
  const getLocalWishlist = () => {
    try {
      const data = localStorage.getItem("guestWishlist");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const setLocalWishlist = (wishlistIds) => {
    localStorage.setItem("guestWishlist", JSON.stringify(wishlistIds));
  };

  // Fetch wishlist on mount and merge guest wishlist if logged in
  useEffect(() => {
    async function fetchWishlist() {
      const token = localStorage.getItem("authToken");
      let wishlistFromDb = [];

      if (token) {
        try {
          wishlistFromDb = await getWishlist();
        } catch (err) {
          console.error("Failed to fetch wishlist from DB:", err);
        }
      }

      const guestWishlist = getLocalWishlist();

      // Merge and remove duplicates
      const mergedWishlistIds = [
        ...new Set([...wishlistFromDb.map((i) => i._id), ...guestWishlist]),
      ];

      // Sync guest wishlist to DB if logged in
      if (token) {
        for (let id of mergedWishlistIds) {
          if (!wishlistFromDb.find((item) => item._id === id)) {
            try {
              await addToWishlist(id);
            } catch (err) {
              console.error("Failed to sync local wishlist to DB:", err);
            }
          }
        }
        localStorage.removeItem("guestWishlist");
      } else {
        // Save merged guest wishlist back to localStorage
        setLocalWishlist(mergedWishlistIds);
      }

      // Set state
      const favoritesMap = {};
      mergedWishlistIds.forEach((id) => {
        favoritesMap[id] = true;
      });
      setFavorites(favoritesMap);
      setLoading(false);
    }

    fetchWishlist();
  }, []);

  // Toggle wishlist item
  const toggleFavorite = async (itemId) => {
    const token = localStorage.getItem("authToken");

    if (favorites[itemId]) {
      // Remove
      setFavorites((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });

      if (token) {
        await removeFromWishlist(itemId);
      } else {
        const guestWishlist = getLocalWishlist().filter((id) => id !== itemId);
        setLocalWishlist(guestWishlist);
      }
    } else {
      // Add
      setFavorites((prev) => ({ ...prev, [itemId]: true }));

      if (token) {
        await addToWishlist(itemId);
      } else {
        const guestWishlist = getLocalWishlist();
        guestWishlist.push(itemId);
        setLocalWishlist(guestWishlist);
      }
    }
  };

  // Mock listings (replace with API data if needed)
  const listings = [
    { _id: "1", title: "iPhone 15 Pro Max 256GB", price: "48,500", location: "Nasr City", time: "2 hours ago" },
    { _id: "2", title: "Toyota Corolla 2023", price: "985,000", location: "Maadi", time: "5 hours ago" },
    { _id: "3", title: "Studio Apartment – New Cairo", price: "12,000/mo", location: "5th Settlement", time: "1 day ago" },
    { _id: "4", title: "MacBook Air M2 2023", price: "62,900", location: "Heliopolis", time: "3 hours ago" },
  ];

  const favoriteListings = listings.filter((item) => favorites[item._id]);

  return (
    <div className="homepage-container">
      <Header />
      <div className="header-spacer" />

      <section className="wishlist-section">
        <div className="wishlist-header-wrapper">
          <div className="wishlist-header">
            <div>
              <h1 className="wishlist-main-title">Your Wishlist</h1>
              {favoriteListings.length > 0 && (
                <p className="wishlist-count">
                  {favoriteListings.length}{" "}
                  {favoriteListings.length === 1 ? "item" : "items"} saved
                </p>
              )}
            </div>
            <Link to="/" className="wishlist-back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>

        {favoriteListings.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
            <p className="wishlist-empty-text">
              Start adding items you love to keep track of them easily.
            </p>
            <Link to="/" className="wishlist-empty-cta">Browse Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {favoriteListings.map((item) => (
              <article key={item._id} className="listing-card">
                <div className="listing-image">
                  <div className="image-placeholder" />
                  <button
                    className={`favorite-heart-btn ${favorites[item._id] ? "favorited" : ""}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item._id); }}
                    aria-label={favorites[item._id] ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="heart-filled">💚</span>
                  </button>
                </div>

                <div className="listing-body">
                  <h3 className="listing-title">{item.title}</h3>
                  <p className="listing-price">EGP {item.price}</p>
                  <div className="listing-meta">
                    <span className="listing-location">Location: {item.location}</span>
                    <span className="listing-time">{item.time}</span>
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
