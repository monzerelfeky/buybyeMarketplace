// pages/Buyer/WishlistPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "../styles/HomePage.css";
import "../styles/Listings.css";
import "../styles/Wishlist.css";
import { getWishlist, addToWishlist, removeFromWishlist } from "../utils/wishlist";

export default function WishlistPage() {
  const [favorites, setFavorites] = useState({}); // Tracks wishlist items (_id => true)
  const [loading, setLoading] = useState(true);

  // Helper: Load guest wishlist from localStorage
  const getLocalWishlist = () => {
    try {
      const localData = localStorage.getItem("guestWishlist");
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  };

  // Helper: Save guest wishlist to localStorage
  const setLocalWishlist = (wishlistIds) => {
    localStorage.setItem("guestWishlist", JSON.stringify(wishlistIds));
  };

  // Fetch wishlist on mount
  useEffect(() => {
    async function fetchWishlist() {
      const token = localStorage.getItem("authToken");
      let wishlistFromDb = [];

      if (token) {
        // Logged-in: fetch from backend
        try {
          wishlistFromDb = await getWishlist(); // [{ _id: "1", ...}, ...]
        } catch (err) {
          console.error("Failed to fetch wishlist from DB:", err);
        }
      }

      // Always get guest wishlist from localStorage
      const guestWishlist = getLocalWishlist();

      // Merge backend and guest wishlist (avoid duplicates)
      const mergedIds = Array.from(
        new Set([...wishlistFromDb.map((i) => i._id), ...guestWishlist])
      );

      // Sync guest wishlist to backend if logged-in
      if (token) {
        for (let id of mergedIds) {
          if (!wishlistFromDb.find((item) => item._id === id)) {
            try {
              await addToWishlist(id);
            } catch (err) {
              console.error("Failed to sync local wishlist to DB:", err);
            }
          }
        }
        localStorage.removeItem("guestWishlist"); // clear after merge
      } else {
        // Save merged guest wishlist
        setLocalWishlist(mergedIds);
      }

      // Update state for rendering
      const favoritesMap = {};
      mergedIds.forEach((id) => (favoritesMap[id] = true));
      setFavorites(favoritesMap);
      setLoading(false);
    }

    fetchWishlist();
  }, []);

  // Toggle wishlist item (same logic as Listings.jsx)
  const toggleFavorite = async (_id) => {
    const token = localStorage.getItem("authToken");

    if (favorites[_id]) {
      // Remove
      setFavorites((prev) => {
        const copy = { ...prev };
        delete copy[_id];
        return copy;
      });

      if (token) {
        await removeFromWishlist(_id);
      } else {
        const guestWishlist = getLocalWishlist().filter((id) => id !== _id);
        setLocalWishlist(guestWishlist);
      }
    } else {
      // Add
      setFavorites((prev) => ({ ...prev, [_id]: true }));

      if (token) {
        await addToWishlist(_id);
      } else {
        const guestWishlist = getLocalWishlist();
        guestWishlist.push(_id);
        setLocalWishlist(guestWishlist);
      }
    }
  };

  // Mock listings using `_id` to match backend
  const listings = [
    {
      _id: "1",
      title: "iPhone 15 Pro Max 256GB",
      price: 48500,
      category: "Mobiles",
      location: "Nasr City",
      deliveryEstimate: "2 hours ago",
    },
    {
      _id: "2",
      title: "Toyota Corolla 2023",
      price: 985000,
      category: "Cars",
      location: "Maadi",
      deliveryEstimate: "5 hours ago",
    },
    {
      _id: "3",
      title: "Studio Apartment – New Cairo",
      price: 12000,
      category: "Real Estate",
      location: "5th Settlement",
      deliveryEstimate: "1 day ago",
    },
    {
      _id: "4",
      title: "MacBook Air M2 2023",
      price: 62900,
      category: "Electronics",
      location: "Heliopolis",
      deliveryEstimate: "3 hours ago",
    },
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
              Back to Home
            </Link>
          </div>
        </div>

        {favoriteListings.length === 0 ? (
          <div className="wishlist-empty">
            <h2>Your wishlist is empty</h2>
          </div>
        ) : (
          <div className="wishlist-grid">
            {favoriteListings.map((item) => (
              <article key={item._id} className="listing-card">
                <div className="listing-image">
                  <div className="image-placeholder" />
                  <button
                    className={`favorite-heart-btn ${
                      favorites[item._id] ? "favorited" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item._id);
                    }}
                    disabled={loading}
                    aria-label={
                      favorites[item._id]
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    💚
                  </button>
                </div>

                <div className="listing-body">
                  <h3 className="listing-title">{item.title}</h3>
                  <p className="listing-price">EGP {item.price.toLocaleString()}</p>
                  <div className="listing-meta">
                    <span className="listing-location">{item.location}</span>
                    <span className="listing-time">{item.deliveryEstimate}</span>
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
