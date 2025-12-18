import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
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

  const formatCategoryName = (name) => {
    return name
      .split(/-|&|\s+/)       // split by dash, ampersand, or space
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");              // join with spaces
  };

  useEffect(() => {
    setLoading(true);

    // Simulated fetch for now
    const fetchProducts = async () => {
      const simulatedData = [
        {
          id: 1,
          name: "Product 1",
          price: 100,
          image: "https://via.placeholder.com/150",
        },
        {
          id: 2,
          name: "Product 2",
          price: 200,
          image: "https://via.placeholder.com/150",
        },
        {
          id: 3,
          name: "Product 3",
          price: 150,
          image: "https://via.placeholder.com/150",
        },
        {
          id: 4,
          name: "Product 4",
          price: 250,
          image: "https://via.placeholder.com/150",
        },
      ];

      // Simulate network delay
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

      {/* Main category content */}
      <div className="category-page">
        <div className="category-header">
          <h1>{formatCategoryName(categoryName)}</h1>
          {subcategory && <h2>{formatCategoryName(subcategory)}</h2>}
        </div>

        <div className="products-container">
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="product-link"
              >
                <div className="product-card">
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>${product.price}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
