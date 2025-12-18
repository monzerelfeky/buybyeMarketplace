import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/ProductPage.css";

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Simulate fetching product data
    const fetchProduct = async () => {
      const simulatedProduct = {
        id: productId,
        name: `Product ${productId}`,
        price: 199,
        description:
          "This is a placeholder description for the product. Details will come from the database later.",
        image: "https://via.placeholder.com/300",
      };
      setTimeout(() => {
        setProduct(simulatedProduct);
        setLoading(false);
      }, 300);
    };

    fetchProduct();
  }, [productId]);

  return (
    <>
      <Header />

      <div className="product-page">
        {loading ? (
          <p>Loading product...</p>
        ) : (
          <>
            <div className="product-details">
              <img src={product.image} alt={product.name} />
              <div className="product-info">
                <h1>{product.name}</h1>
                <p className="product-price">${product.price}</p>
                <p className="product-description">{product.description}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
