// components/Listings.jsx
import React from "react";
import "../styles/Listings.css";

export default function Listings({
  favorites = {},                 // ✅ default to empty object
  toggleFavorite = () => {},      // ✅ default to no-op function
}) {
  // Your mock listing data
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

  return (
    <section className="listings-section">
      <div className="listings-header">
        <h2 className="listings-title">Latest Listings</h2>
      </div>

      <div className="listings-grid">
        {listings.map((item) => (
          <article key={item.id} className="listing-card">
            <div className="listing-image">
              <div className="image-placeholder" />

              {/* Favorite Button */}
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
    </section>
  );
}
