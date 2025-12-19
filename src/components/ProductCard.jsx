// components/ProductCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { getWishlist, addToWishlist, removeFromWishlist } from "../utils/wishlist";
import "../styles/ProductCard.css";

export default function ProductCard({
  id,
  title,
  price,
  image,
  time,
  currency = "EGP",
  onClick,
}) {
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    } else {
      navigate(`/product/${id}`);
    }
  };

  // Fetch wishlist once
  useEffect(() => {
    async function fetchWishlist() {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const wishlist = await getWishlist();
        const exists = wishlist.some((item) => item._id === id);
        setIsFavorite(exists);
      } catch (err) {
        console.error("Wishlist fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [id]);


  // Toggle wishlist
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to use wishlist");
      return;
    }

    try {
      if (isFavorite) {
        await removeFromWishlist(id);
        setIsFavorite(false);
      } else {
        await addToWishlist(id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      alert("Failed to update wishlist");
    }
  };

  return (
    <article className="product-card" onClick={handleCardClick}>
      <div className="product-card-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="image-placeholder" />
        )}

        {/* Favorite Button - Only show if onToggleFavorite is provided */}
          <button
            className={`favorite-btn ${isFavorite ? "favorited" : ""}`}
            onClick={handleFavoriteClick}
            disabled={loading}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            {isFavorite ? (
              <FaHeart className="heart-icon filled" />
            ) : (
              <FaRegHeart className="heart-icon" />
            )}
          </button>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{title}</h3>
        <p className="product-card-price">
          {currency} {price}
        </p>
        {time && (
          <div className="product-card-meta">
            <span className="product-card-time">{time}</span>
          </div>
        )}
      </div>
    </article>
  );
}