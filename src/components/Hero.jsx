// src/components/Hero.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";

export default function Hero() {
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  // Navigate to search page
  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/category/all?query=${encodeURIComponent(trimmed)}`);
  };

  // Press Enter to search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">BuyBye</h1>

          <p className="hero-subtitle">
            The modern marketplace for your city - cars, homes, electronics, and more.
          </p>

          {/* SEARCH BAR */}
          <div className="hero-search-wrapper">
            <div className="hero-search-bar">
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search items, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button className="hero-search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
