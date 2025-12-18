// pages/Buyer/WishlistPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import "../../styles/HomePage.css";
import "../../styles/Listings.css";
import "../../styles/Wishlist.css";
import Header from "../../components/Header";

export default function WishlistPage({
  favorites = {},
  toggleFavorite = () => {},
}) {

  const categories = [
    "Cars",
    "Real Estate",
    "Mobiles",
    "Jobs",
    "Electronics",
    "Home & Garden",
  ];

  // Same mock data as Listings.jsx
  const listings = [
    {
      id: 1,
      title: "iPhone 15 Pro Max 256GB",
      price: "48,500",
      location: "Nasr City",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Toyota Corolla 2023",
      price: "985,000",
      location: "Maadi",
      time: "5 hours ago",
    },
    {
      id: 3,
      title: "Studio Apartment – New Cairo",
      price: "12,000/mo",
      location: "5th Settlement",
      time: "1 day ago",
    },
    {
      id: 4,
      title: "MacBook Air M2 2023",
      price: "62,900",
      location: "Heliopolis",
      time: "3 hours ago",
    },
  ];

  const favoriteListings = listings.filter((item) => favorites[item.id]);

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
              {favoriteListings.length > 0 && (
                <p className="wishlist-count">
                  {favoriteListings.length}{" "}
                  {favoriteListings.length === 1 ? "item" : "items"} saved
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

        {favoriteListings.length === 0 ? (
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
            {favoriteListings.map((item) => (
              <article key={item.id} className="listing-card">
                <div className="listing-image">
                  <div className="image-placeholder" />

                  {/* ✅ Same favorite button as Listings.jsx */}
                  <button
                    className={`favorite-heart-btn ${
                      favorites[item.id] ? "favorited" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    aria-label={
                      favorites[item.id]
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
                  <p className="listing-price">EGP {item.price}</p>
                  <div className="listing-meta">
                    <span className="listing-location">
                      Location: {item.location}
                    </span>
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
