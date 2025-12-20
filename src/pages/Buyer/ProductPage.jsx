import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RateReview from "../../components/RateReview";
import "../../styles/ProductPage.css";


export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);

    const fetchProduct = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/items/${productId}`);
        if (!res.ok) throw new Error("Product fetch failed");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const maxQty = product?.quantity ?? 1;
  useEffect(() => {
    const next = Math.max(1, Math.min(quantity, maxQty));
    setQuantity(next);
    setQuantityInput(String(next));
  }, [maxQty]);

  const increaseQty = () => {
    setQuantity((q) => {
      const next = Math.min(q + 1, maxQty);
      setQuantityInput(String(next));
      return next;
    });
  };
  const decreaseQty = () => {
    setQuantity((q) => {
      const next = q > 1 ? q - 1 : 1;
      setQuantityInput(String(next));
      return next;
    });
  };
  const handleQtyChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setQuantityInput("");
      return;
    }
    if (!/^\d+$/.test(value)) return;
    setQuantityInput(value);
  };

  const commitQtyInput = () => {
    const parsed = Number(quantityInput);
    const next = Number.isFinite(parsed) ? Math.max(1, Math.min(parsed, maxQty)) : 1;
    setQuantity(next);
    setQuantityInput(String(next));
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }
    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
    fetch(`${API_BASE}/api/users/me/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId: product._id, quantity }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Add to cart failed");
        return res.json();
      })
      .then(() => {
        window.dispatchEvent(new Event("cart-updated"));
        alert("Added to cart");
      })
      .catch((err) => {
        console.error("Add to cart error:", err);
        alert("Failed to add to cart");
      });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    console.log(isWishlisted ? "Removed from wishlist" : "Added to wishlist", product);
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
              <img
                src={
                  product.images?.[0]
                    ? (() => {
                        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
                        const img = product.images[0];
                        if (img.startsWith("http://") || img.startsWith("https://")) return img;
                        if (img.startsWith("data:")) return img;
                        if (img.includes("uploads/images/")) {
                          const filename = img.split("uploads/images/").pop();
                          return `${API_BASE}/uploads/images/${filename}`;
                        }
                        if (img.startsWith("/")) return `${API_BASE}${img}`;
                        return `${API_BASE}/uploads/images/${img}`;
                      })()
                    : "https://via.placeholder.com/300"
                }
                alt={product.title}
              />
            </div>

            {/* Product Information */}
            <div className="product-content">
              <div className="product-header">
                <h1 className="product-title">{product.title}</h1>
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

              <p className="product-price">EGP {Number(product.price || 0).toFixed(2)}</p>
              
              {product.quantity > 0 ? (
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
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={maxQty}
                      className="quantity-display"
                      value={quantityInput}
                      onChange={handleQtyChange}
                      onBlur={commitQtyInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitQtyInput();
                        }
                      }}
                    />
                    <button
                      onClick={increaseQty}
                      aria-label="Increase quantity"
                      disabled={quantity >= maxQty}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={handleAddToCart}
                    disabled={product.quantity <= 0}
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                </div>

                <div className="AI-container">
                  <p>AI comments summary..</p>
                  <button>Summarize Comments</button>
                </div>

                <div className="comment-section">
                  <RateReview productId={productId} />
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
