import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/CategoryPage.css";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const subcategory = params.get("subcategory");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});

  const formatCategoryName = (name) => {
    return name
      .split(/-|\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    setLoading(true);

    const fetchProducts = async () => {
      const simulatedData = [
        {
          id: 1,
          title: "Product 1",
          price: "100",
          image: "https://via.placeholder.com/150",
          time: "2 hours ago",
        },
        {
          id: 2,
          title: "Product 2",
          price: "200",
          image: "https://via.placeholder.com/150",
          time: "5 hours ago",
        },
        {
          id: 3,
          title: "Product 3",
          price: "150",
          image: "https://via.placeholder.com/150",
          time: "1 day ago",
        },
        {
          id: 4,
          title: "Product 4",
          price: "250",
          image: "https://via.placeholder.com/150",
          time: "3 hours ago",
        },
      ];

      setTimeout(() => {
        setProducts(simulatedData);
        setLoading(false);
      }, 500);
    };

    fetchProducts();
  }, [categoryName, subcategory]);

  return (
    <>
      <Header />

      <div className="category-page">
        <div className="category-header">
          <h1>{formatCategoryName(categoryName)}</h1>
          {subcategory && <h2>{formatCategoryName(subcategory)}</h2>}
        </div>

        <div className="products-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <p className="no-products">No products found.</p>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.image}
                time={product.time}
                isFavorite={favorites[product.id]}
                onToggleFavorite={toggleFavorite}
              />
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}