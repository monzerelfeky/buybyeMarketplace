import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/ProductPage.css";


export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryRequested, setSummaryRequested] = useState(false);

  useEffect(() => {
    setLoading(true);

    const fetchProduct = async () => {
      const simulatedProduct = {
        id: productId,
        name: `Product ${productId}`,
        price: 199,
        description:
          "This is a placeholder description for the product. Details will come from the database later.",
        image: "https://via.placeholder.com/300",
        inStock: true,
      };
      setTimeout(() => {
        setProduct(simulatedProduct);
        setLoading(false);
      }, 300);
    };

    fetchProduct();
  }, [productId]);

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    console.log("Added to cart:", { product, quantity });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    console.log(isWishlisted ? "Removed from wishlist" : "Added to wishlist", product);
  };

  const handleSummarizeReviews = async () => {
    if (!productId) return;

    setSummaryLoading(true);
    setSummaryError("");
    setSummaryRequested(true);

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/items/${productId}/reviews/summary`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Summary unavailable");
      }

      if (data.message) {
        setReviewSummary(null);
        setSummaryError(data.message);
        return;
      }

      setReviewSummary(data);
    } catch (err) {
      console.error("Failed to summarize reviews:", err);
      setReviewSummary(null);
      setSummaryError("Summary unavailable");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="product-page">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading product...</p>
          </div>
        ) : !product ? (
          <p className="error-message">Product not found</p>
        ) : (
          <div className="product-container">
            {/* Image Gallery */}
            <div className="img-gallery">
              <img src={product.image} alt={product.name} />
            </div>

            {/* Product Information */}
            <div className="product-content">
              <div className="product-header">
                <h1 className="product-title">{product.name}</h1>
                <button
                  className="wishlist-btn"
                  onClick={toggleWishlist}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? (
                    <FaHeart className="heart-icon filled" />
                  ) : (
                    <FaRegHeart className="heart-icon" />
                  )}
                </button>
              </div>

              <p className="product-price">${product.price.toFixed(2)}</p>
              
              {product.inStock ? (
                <span className="stock-badge in-stock">In Stock</span>
              ) : (
                <span className="stock-badge out-of-stock">Out of Stock</span>
              )}

              <p className="product-description">{product.description}</p>

              {/* Quantity and Actions */}
              <div className="purchase-section">
                <div className="quantity-control">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-buttons">
                    <button
                      onClick={decreaseQty}
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button onClick={increaseQty} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                </div>

                <div className="ai-summary-section">
                  <div className="ai-summary-title">AI comments summary</div>
                  <div className="ai-summary-card">
                    <div className="ai-summary-actions">
                      {!summaryRequested && (
                        <button
                          className="btn btn-primary ai-summary-button"
                          onClick={handleSummarizeReviews}
                          disabled={summaryLoading}
                        >
                          {summaryLoading ? "Summarizing..." : "Summarize Reviews"}
                        </button>
                      )}
                      {summaryRequested && summaryLoading && (
                        <div className="ai-summary-loading">Summarizing...</div>
                      )}
                      {summaryRequested && !summaryLoading && !reviewSummary && summaryError && (
                        <div className="ai-summary-error">{summaryError}</div>
                      )}
                    </div>

                    {reviewSummary?.summary && (
                      <div className="ai-summary-result">
                        <p>{reviewSummary.summary}</p>
                        <div className="ai-summary-meta">
                          <span>Sentiment: {reviewSummary.sentiment}</span>
                          {reviewSummary.averageRating !== null && reviewSummary.averageRating !== undefined && (
                            <span>Average rating: {reviewSummary.averageRating} / 5</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="comment-section">
                  
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
    );
  }