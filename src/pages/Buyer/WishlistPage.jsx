// pages/Buyer/WishlistPage.jsx
import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { getWishlist } from "../../utils/wishlist";
import "../../styles/Wishlist.css";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // For now we use mock data
  const mockItems = [
    {
      id: "1",
      title: "iPhone 15 Pro Max 256GB",
      price: 48500,
      image: "/images/iphone15.jpg",
      time: "2 hours ago",
    },
    {
      id: "2",
      title: "Toyota Corolla 2023",
      price: 985000,
      image: "/images/corolla2023.jpg",
      time: "5 hours ago",
    },
    {
      id: "3",
      title: "Studio Apartment – New Cairo",
      price: 12000,
      image: "/images/studio.jpg",
      time: "1 day ago",
    },
  ];

  useEffect(() => {
    async function fetchWishlist() {
      try {
        // In the future, getWishlist will fetch real items from backend
        const data = await getWishlist();
        console.log("Wishlist from backend:", data);

        // For now, just use mock items
        setWishlistItems(mockItems);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setWishlistItems(mockItems);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, []);

  return (
    <div className="wishlist-page">
      <Header />
      <div className="header-spacer" />

      <section className="wishlist-section">
        <h1 className="wishlist-main-title">Your Wishlist</h1>
        {wishlistItems.length === 0 && !loading ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
            <p className="wishlist-empty-text">
              Start adding items you love to keep track of them easily.
            </p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                image={item.image}
                time={item.time}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
