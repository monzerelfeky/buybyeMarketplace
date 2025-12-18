// src/components/Hero.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  // Mocked JSON search data
  const DATA = {
    categories: [
      "Cars",
      "Real Estate",
      "Mobiles",
      "Jobs",
      "Electronics",
      "Home & Garden",
      "Sports",
      "Fashion",
      "Services",
    ],
    popularItems: [
      "iPhone 15",
      "Toyota Camry",
      "MacBook Pro",
      "Samsung S24",
      "Gaming Laptop",
      "Road Bicycle",
      "Studio Apartment",
      "AirPods Pro",
      "Sony WH-1000XM5",
      "Office Chair",
    ],
  };

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

  const runSearch = (text) => {
    const lower = text.toLowerCase();

    const matchedCategories = DATA.categories.filter((cat) =>
      cat.toLowerCase().includes(lower)
    );

    const matchedItems = DATA.popularItems.filter((item) =>
      item.toLowerCase().includes(lower)
    );

    setSuggestions([...matchedCategories, ...matchedItems]);
    setShowSuggestions(true);
  };

  // Navigate to search page
  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  // Select suggestion — navigate + fill input
  const handleSelectSuggestion = (value) => {
    setQuery(value);
    setShowSuggestions(false);
    navigate(`/search?query=${encodeURIComponent(value)}`);
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
