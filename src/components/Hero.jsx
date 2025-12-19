// src/components/Hero.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      runSearch(query);
    }, 150);

    return () => clearTimeout(timeout);
  }, [query]);

  const runSearch = async (text) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/items/suggestions?query=${encodeURIComponent(text)}`
      );
      if (!res.ok) throw new Error("Suggestion request failed");
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Suggestion fetch failed:", err);
      setSuggestions([]);
    }
  };

  // Navigate to search page
  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/category/all?query=${encodeURIComponent(query)}`);
  };

  // Select suggestion — navigate + fill input
  const handleSelectSuggestion = (value) => {
    setQuery(value);
    setShowSuggestions(false);
    navigate(`/category/all?query=${encodeURIComponent(value)}`);
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
            The modern marketplace for your city — cars, homes, electronics, and more.
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
                onFocus={() => query && setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
              />

              <button className="hero-search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>

            {/* SUGGESTIONS DROPDOWN */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="hero-hint">
            Popular: iPhone 15 • Toyota Camry • Studio Apartment • MacBook Pro
          </p>
        </div>
      </div>
    </section>
  );
}
