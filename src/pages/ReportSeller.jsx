import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ReportSeller.css";

export default function ReportSellerPage() {
  // Mock order data (NO backend)
  const order = {
    products: [
      {
        _id: "1",
        name: "Wireless Headphones",
        price: 59.99,
        quantity: 1,
        image: "https://via.placeholder.com/90",
        seller: "AudioWorld",
      },
      {
        _id: "2",
        name: "Smart Watch",
        price: 129.99,
        quantity: 1,
        image: "https://via.placeholder.com/90",
        seller: "TechGear",
      },
      {
        _id: "3",
        name: "Phone Case",
        price: 19.99,
        quantity: 2,
        image: "https://via.placeholder.com/90",
        seller: "CaseCorner",
      },
    ],
  };

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState(null);

  // Single-select toggle
  const selectProduct = (id) => {
    setSelectedProducts([id]);
  };

  // Get selected product info
  const selectedProduct = order.products.find((p) =>
    selectedProducts.includes(p._id)
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProducts.length || !details.trim()) {
      alert("Please select a product and describe the issue.");
      return;
    }

    console.log({
      product: selectedProduct.name,
      seller: selectedProduct.seller,
      details,
      evidence,
    });

    alert("Report submitted successfully.");

    setSelectedProducts([]);
    setDetails("");
    setEvidence(null);
  };

  return (
    <>
      <Header />

      <div className="report-page">
        {/* LEFT SIDE – PRODUCTS (single select) */}
        <div className="report-left">
          <h2>Select a product</h2>

          <div className="products-wrapper">
            {order.products.map((p) => (
              <div
                key={p._id}
                className={`product-card ${
                  selectedProducts.includes(p._id) ? "selected" : ""
                }`}
                onClick={() => selectProduct(p._id)}
              >
                <img src={p.image} alt={p.name} />

                <div className="product-info">
                  <h4>{p.name}</h4>
                  <p>Quantity: {p.quantity}</p>
                  <p style={{ fontStyle: "italic", fontSize: "13px", color: "#555" }}>
                    Seller: {p.seller}
                  </p>
                </div>

                <div className="product-price">${p.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE – REPORT FORM */}
        <div className="report-right">
          <h2>Report Seller</h2>

          {selectedProduct ? (
            <form className="report-form" onSubmit={handleSubmit} autoComplete="off">
              <p>
                <strong>Seller:</strong> {selectedProduct.seller}
              </p>

              <div className="form-group">
                <label className="form-label">
                  Describe the issue <span>*</span>
                </label>
                <textarea
                  placeholder="Explain the problem you faced with the selected product..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload evidence (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setEvidence(e.target.files[0])}
                />
              </div>

              <button
                type="submit"
                className="submit-btn-report"
                disabled={!selectedProducts.length}
              >
               flag seller
              </button>
            </form>
          ) : (
            <p style={{ color: "#777", fontStyle: "italic" }}>
              Select a product from the left to report an issue.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
