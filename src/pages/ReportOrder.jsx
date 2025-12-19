import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ReportOrder.css";

export default function ReportSeller() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [problem, setProblem] = useState("");

  // Explicit reset on mount (avoids hot-reload / autofill issues)
  useEffect(() => {
    setSelectedProducts([]);
    setProblem("");
  }, []);

  const products = [
    { name: "Wireless Headphones", price: 120 },
    { name: "Phone Case", price: 30 },
    { name: "USB-C Charger", price: 25 },
  ];

  const toggleProduct = (productName) => {
    setSelectedProducts((prev) =>
      prev.includes(productName)
        ? prev.filter((p) => p !== productName)
        : [...prev, productName]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0 || problem.trim() === "") {
      alert("Please select at least one product and describe the problem.");
      return;
    }

    console.log({
      products: selectedProducts,
      problem,
    });

    alert("Your report has been submitted.");
    setSelectedProducts([]);
    setProblem("");
  };

  return (
    <>
      <Header />

      <div className="report-page">
        {/* LEFT CONTAINER */}
        <div className="report-left">
          <h2>Order Information</h2>

          <div className="order-id-box">
            <span>Order ID</span>
            <strong>#123456</strong>
          </div>

          <div className="products-wrapper">
            {products.map((p) => (
              <div
                key={p.name}
                className={`product-card ${
                  selectedProducts.includes(p.name) ? "selected" : ""
                }`}
              >
                <img
                  src="https://via.placeholder.com/100"
                  alt={p.name}
                />
                <div className="product-info">
                  <h4>{p.name}</h4>
                  <p>Quantity: 1</p>
                </div>
                <div className="product-price">${p.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONTAINER */}
        <div className="report-right">
          <h2>Report a Problem</h2>

          <form
            className="report-form"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {/* PRODUCT SELECTION */}
            <div className="form-group">
              <label className="form-label">
                Select affected products <span>*</span>
              </label>

              <div className="checkbox-group">
                {products.map((p) => (
                  <label key={p.name} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(p.name)}
                      onChange={() => toggleProduct(p.name)}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>

            {/* PROBLEM DESCRIPTION */}
            <div className="form-group">
              <label className="form-label">
                Describe the problem <span>*</span>
              </label>
              <textarea
                placeholder="Explain what went wrong with the selected product(s)..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn-report">
              Submit Report
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
