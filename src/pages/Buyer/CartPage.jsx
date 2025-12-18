import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/CartPage.css";

export default function CartPage() {
  const dummyCartItems = [
    {
      id: 1,
      name: "Sample Product",
      price: 120,
      image: "https://via.placeholder.com/120",
    },
    {
      id: 2,
      name: "Another Product",
      price: 90,
      image: "https://via.placeholder.com/120",
    },
  ];

  return (
    <>
      <Header />

      <div className="cart-page">
        <h1>Your Cart</h1>

        <div className="cart-page-items">
          {dummyCartItems.map((item) => (
            <div className="cart-page-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="cart-page-info">
                <h3>{item.name}</h3>
                <p>${item.price}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="cart-checkout-btn">Checkout</button>
      </div>

      <Footer />
    </>
  );
}


