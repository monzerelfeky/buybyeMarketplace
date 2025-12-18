import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/SearchPage.css";

export default function SearchPage() {
  const location = useLocation();

  // Extract query from URL
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  return (
    <div className="page-wrapper">
          <Header />
          <div className="searchpage-header-spacer" />
          <div className="searchpage-container">
            <div className="search-results">
              <h2>Search Results for: "{query}"</h2>
              {/* Render results here */}
              <p>(Results will appear here)</p>
            </div>
          </div>
          <Footer />
    </div>
    
  );
}
