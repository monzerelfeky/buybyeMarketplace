import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function ShippingPolicy() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Shipping Policy</h1>
          <div className="page-content">
            <p>
              BuyBye offers flexible shipping options across Egypt to ensure your items 
              arrive safely and on time.
            </p>

            <h2>📦 Shipping Methods</h2>
            <ul>
              <li><strong>Standard Delivery (3-5 business days)</strong> - Economical shipping for most items</li>
              <li><strong>Express Delivery (1-2 business days)</strong> - Fast shipping for urgent orders</li>
              <li><strong>Local Pickup (Free)</strong> - Meet the seller in person at a safe location</li>
              <li><strong>Same-Day Delivery</strong> - Available in select Cairo areas</li>
            </ul>

            <h2>💰 Shipping Costs</h2>
            <p>
              Shipping costs vary based on:
            </p>
            <ul>
              <li>Item size and weight</li>
              <li>Delivery location</li>
              <li>Shipping speed selected</li>
              <li>Seller's shipping policies</li>
            </ul>
            <p>
              <strong>Free Shipping:</strong> Many sellers offer free shipping on eligible items. 
              Look for the "Free Shipping" badge on listings.
            </p>

            <h2>🌍 Delivery Locations</h2>
            <p>We deliver to all major cities and governorates in Egypt including:</p>
            <ul>
              <li>Cairo & Giza</li>
              <li>Alexandria</li>
              <li>Red Sea (Hurghada, Sharm El Sheikh)</li>
              <li>Upper Egypt (Luxor, Aswan)</li>
              <li>Delta Region</li>
              <li>Suez Canal Zone</li>
            </ul>

            <h2>📱 Tracking Your Order</h2>
            <p>
              All shipped orders include tracking numbers. You'll receive:
            </p>
            <ul>
              <li>SMS notifications with tracking link</li>
              <li>Email updates at each shipping milestone</li>
              <li>Real-time tracking in your BuyBye account</li>
              <li>Estimated delivery date</li>
            </ul>

            <h2>📋 Shipping Process</h2>
            <ol>
              <li><strong>Order Placed</strong> - Seller receives your order</li>
              <li><strong>Preparing</strong> - Seller packages your item securely</li>
              <li><strong>Shipped</strong> - Item picked up by courier</li>
              <li><strong>In Transit</strong> - On the way to you</li>
              <li><strong>Out for Delivery</strong> - Arriving today</li>
              <li><strong>Delivered</strong> - Successfully received</li>
            </ol>

            <h2>🎁 Packaging Standards</h2>
            <p>All sellers must:</p>
            <ul>
              <li>Use appropriate packaging materials</li>
              <li>Secure items to prevent damage</li>
              <li>Include item description on package</li>
              <li>Add fragile stickers when necessary</li>
            </ul>

            <h2>🚚 Delivery Issues</h2>
            <h3>Item Not Delivered:</h3>
            <p>
              If your item hasn't arrived within the estimated timeframe:
            </p>
            <ol>
              <li>Check tracking for updates</li>
              <li>Contact the courier service</li>
              <li>Reach out to the seller</li>
              <li>Contact BuyBye support if unresolved</li>
            </ol>

            <h3>Damaged Items:</h3>
            <p>
              If you receive a damaged item:
            </p>
            <ul>
              <li>Take photos of damage and packaging</li>
              <li>Report within 48 hours of delivery</li>
              <li>Contact seller and BuyBye support</li>
              <li>Keep all packaging materials</li>
            </ul>

            <h2>🌏 International Shipping</h2>
            <p>
              Currently, BuyBye focuses on domestic shipping within Egypt. International 
              shipping may be available from select sellers—check individual listings 
              for details.
            </p>

            <h2>📞 Need Help?</h2>
            <p>
              For shipping questions or issues, contact our support team at 
              support@buybye.eg or call +20 2 1234 5678 (Sun-Thu, 9AM-6PM).
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}