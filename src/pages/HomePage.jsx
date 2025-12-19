import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Listings from "../components/Listings";
import Footer from "../components/Footer";
import "../styles/HomePage.css";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("http://localhost:5000/api/items");
        if (!res.ok) throw new Error("Failed to fetch items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  return (
    <div className="homepage-container">
      <Header />
      <div className="header-spacer" />
      <Hero />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No items available at the moment.</p>
        </div>
      ) : (
        <Listings items={items} />
      )}
      <Footer />
    </div>
  );
} 