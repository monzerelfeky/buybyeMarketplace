import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function OurStory() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Our Story</h1>
          <div className="page-content">
            <p>
              Founded in 2024, BuyBye was created to revolutionize the Egyptian marketplace experience. 
              We believe in connecting people across Egypt through a safe, modern platform that makes 
              buying and selling effortless.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              To empower Egyptians to buy and sell with confidence, making every transaction 
              seamless, secure, and successful. We're building more than a marketplace—we're 
              creating a community of trust.
            </p>

            <h2>Our Vision</h2>
            <p>
              To become Egypt's most trusted and innovative marketplace, where millions of people 
              connect daily to exchange goods and services safely and efficiently.
            </p>

            <h2>Our Values</h2>
            <ul>
              <li><strong>Trust & Transparency</strong> - We build trust through honest communication and fair practices</li>
              <li><strong>Customer First</strong> - Our users' success is our success</li>
              <li><strong>Innovation</strong> - We continuously improve to serve you better</li>
              <li><strong>Community</strong> - We're building lasting relationships, not just transactions</li>
              <li><strong>Local Focus</strong> - Proudly Egyptian, serving Egyptian communities</li>
            </ul>

            <h2>Our Journey</h2>
            <p>
              What started as a simple idea—making buying and selling easier in Egypt—has grown 
              into a thriving platform serving thousands of users across the country. From Cairo 
              to Alexandria, from Luxor to Hurghada, BuyBye connects Egyptians with the items 
              they need and helps sellers reach buyers nationwide.
            </p>

            <h2>Why BuyBye?</h2>
            <p>
              The name "BuyBye" represents our philosophy: when you find what you're looking for, 
              the search is over—just buy it and say "bye" to endless scrolling. We make the 
              process that simple.
            </p>

            <h2>Join Our Story</h2>
            <p>
              Whether you're a buyer looking for great deals or a seller building your business, 
              you're part of the BuyBye story. Together, we're transforming how Egypt shops online.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
