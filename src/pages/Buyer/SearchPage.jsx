import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import "../../styles/SearchPage.css";

export default function SearchPage({ mockResults = [] }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  const [results, setResults] = useState([]);

  useEffect(() => {
    // For now, use mockResults if provided
    setResults(mockResults);
  }, [mockResults, query]);

  return (
    <div className="page-wrapper">
      <Header />
      <div className="searchpage-header-spacer" />

      <div className="searchpage-container">
        <h2>Search Results for: "{query}"</h2>

        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div className="search-results-grid">
            {results.map((item) => (
              <ProductCard
                key={item._id}
                id={item._id}
                title={item.title}
                price={item.price}
                image={item.images?.[0] || null}
                time={item.deliveryEstimate}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
