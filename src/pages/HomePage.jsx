import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Listings from "../components/Listings";
import Footer from "../components/Footer";
import "../styles/HomePage.css";

export default function HomePage({ favorites, toggleFavorite }) {
  return (
    <div className="homepage-container">
      <Header />
      <div className="header-spacer" />
      <Hero />
      <Listings favorites={favorites} toggleFavorite={toggleFavorite} />
      <Footer />
    </div>
  );
}
