// src/components/popups/CreateItemContent.jsx
import React, { useState } from "react";
import "../../styles/seller/createItem.css";

export default function CreateItemContent({ onSave, onClose }) {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [deliveryEstimate, setDeliveryEstimate] = useState("5-7 days");

  // ✅ Now stores File objects (not base64)
  const [images, setImages] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // limit to 10 total
    const remainingSlots = 10 - images.length;
    const selected = files.slice(0, remainingSlots);

    setImages((prev) => [...prev, ...selected]);

    // allow selecting same file again later
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Upload selected files to your backend -> backend uploads to Cloudinary
  const uploadImagesToCloudinary = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const res = await fetch(`${API_BASE}/api/upload/listing-images`, {
      method: "POST",
      body: formData,
      // ⚠️ do NOT set Content-Type manually; browser will set boundary correctly
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = data?.message || "Image upload failed";
      throw new Error(msg);
    }

    // Expect: { images: [{ url, publicId, ... }] }
    return Array.isArray(data?.images) ? data.images : [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      // 1) Upload images first (if any)
      const uploadedImages = images.length ? await uploadImagesToCloudinary(images) : [];

      // 2) Normalize price & quantity
      const normalizedPrice = Number.isFinite(Number(price))
        ? Math.round(Number(price) * 100) / 100
        : 0;

      const normalizedQty = Number.isFinite(Number(quantity)) ? Number(quantity) : 0;

      // 3) Build item payload that will be saved in MongoDB
      const newItem = {
        seller: localStorage.getItem("userId"),
        title,
        description,
        price: normalizedPrice,
        quantity: normalizedQty,
        category,
        deliveryEstimate,
        isActive: true,

        // ✅ THIS is what your DB should store now
        // e.g. [{ url: "https://res.cloudinary.com/..." , publicId: "..." }]
        images: uploadedImages,
      };

      // 4) Save item (your parent component should POST to /api/items)
      await onSave?.(newItem);

      // 5) Close
      onClose?.();
    } catch (err) {
      console.error("Create item failed:", err);
      alert(err.message || "Failed to create item. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
            <label className="ci-label">Price (EGP)</label>
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
              disabled={submitting}
            />
            <label className="ci-upload-label">
              <span className="ci-upload-icon">📸</span>
              <p className="ci-upload-hint">
                Click to browse (up to 10 photos)
              </p>
            </label>
          </div>

          {/* IMAGE PREVIEW GRID */}
          {images.length > 0 && (
            <div className="ci-preview-grid">
              {images.map((file, idx) => (
                <div key={`${file.name}-${file.size}-${idx}`} className="ci-preview-img">
                  <img src={URL.createObjectURL(file)} alt="preview" />
                  <button
                    type="button"
                    className="ci-remove-img"
                    onClick={() => handleRemoveImage(idx)}
                    disabled={submitting}
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
          <button type="submit" className="ci-btn primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create Item"}
          </button>
        </div>
      </form>
    </>
  );
}
