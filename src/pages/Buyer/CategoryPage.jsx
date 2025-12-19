import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Listings from "../../components/Listings";
import "../../styles/CategoryPage.css";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const subcategory = params.get("subcategory");
  const query = params.get("query");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const formatCategoryName = (name) => {
    return name
      .split(/-|\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const formattedCategory =
          subcategory
            ? formatCategoryName(subcategory)
            : categoryName === "all"
              ? ""
              : formatCategoryName(categoryName);
        const searchParams = new URLSearchParams();
        if (formattedCategory) searchParams.set("category", formattedCategory);
        if (query) searchParams.set("query", query);

        const res = await fetch(
          `${API_BASE}/api/items?${searchParams.toString()}`
        );
        if (!res.ok) throw new Error("Category fetch failed");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE, categoryName, subcategory, query]);

  return (
    <>
      <Header />

      <div className="category-page">
        <div className="category-header">
          <h1>
            {categoryName === "all"
              ? "Search Results"
              : formatCategoryName(categoryName)}
          </h1>
          {subcategory && <h2>{formatCategoryName(subcategory)}</h2>}
        </div>

        <div className="category-results">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <p className="no-products">No products found.</p>
          ) : (
            <Listings items={products} />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
