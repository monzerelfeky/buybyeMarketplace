// src/components/popups/CreateItemContent.jsx
import React, { useState } from "react";
import "../../styles/seller/createItem.css";

export default function CreateItemContent({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [deliveryEstimate, setDeliveryEstimate] = useState("5-7 days");
  const [images, setImages] = useState([]);

  // Helper: file → base64 Promise
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(reader.result); // base64 string
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Optional: limit to 10 total
    const remainingSlots = 10 - images.length;
    const toRead = files.slice(0, remainingSlots);

    const base64s = await Promise.all(
      toRead.map((file) => fileToBase64(file))
    );

    const newImages = base64s.map((base64) => ({
      id: Math.random().toString(36).slice(2),
      base64,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert image objects to base64 strings for backend
    const imageStrings = images.map(img => img.base64).filter(b64 => b64);

    // Normalize and round price to two decimals to avoid floating-point drift
    const normalizedPrice = Number.isFinite(Number(price)) ? Math.round(Number(price) * 100) / 100 : 0;

    const newItem = {
      seller: localStorage.getItem("userId"), // or parsed user._id
      title,
      description,
      price: normalizedPrice,
      quantity: Number.isFinite(Number(quantity)) ? Number(quantity) : 0,
      category,
      deliveryEstimate,
      isActive: true,
      images: imageStrings
    };

    // Pass item with images to context
    onSave?.(newItem, images);
    onClose?.();
  };

  return (
    <>
      {/* Header */}
      <div className="ci-header">
        <h2 className="ci-title">Create New Item</h2>
      </div>

      <form className="ci-form" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="ci-field">
          <label className="ci-label">Title</label>
          <input
            type="text"
            className="ci-input"
            placeholder="e.g. iPhone 15 Pro 256GB"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="ci-field">
          <label className="ci-label">Description</label>
          <textarea
            className="ci-textarea"
            placeholder="Describe condition, specs, what's included..."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Price + Quantity */}
        <div className="ci-row">
          <div className="ci-field half">
            <label className="ci-label">Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="ci-input"
              placeholder="249.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="ci-field half">
            <label className="ci-label">Quantity</label>
            <input
              type="number"
              min="0"
              step="1"
              className="ci-input"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Category */}
        <div className="ci-row">
          <div className="ci-field half">
            <label className="ci-label">Category</label>
            <select
              className="ci-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Electronics</option>
              <option>Cars</option>
              <option>Home & Garden</option>
              <option>Sports & fitness</option>
            </select>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="ci-field">
          <label className="ci-label">Delivery Estimate</label>
          <input
            type="text"
            className="ci-input"
            placeholder="e.g., 5-7 days"
            value={deliveryEstimate}
            onChange={(e) => setDeliveryEstimate(e.target.value)}
            required
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div className="ci-field">
          <label className="ci-label">Upload Images</label>

          <div className="ci-upload-area">
            <input
              type="file"
              multiple
              accept="image/*"
              className="ci-file-input"
              onChange={handleImageUpload}
            />
            <label className="ci-upload-label">
              <span className="ci-upload-icon">📸</span>
              <p className="ci-upload-hint">
                Click to browse or drag &amp; drop (up to 10 photos)
              </p>
            </label>
          </div>


          {/* IMAGE PREVIEW GRID */}
          {images.length > 0 && (
            <div className="ci-preview-grid">
              {images.map((img) => (
                <div key={img.id} className="ci-preview-img">
                  <img src={img.base64} alt="preview" />
                  <button
                    type="button"
                    className="ci-remove-img"
                    onClick={() => handleRemoveImage(img.id)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="ci-actions">
          <button type="submit" className="ci-btn primary">
            Create Item
          </button>
        </div>
      </form>
    </>
  );
}
