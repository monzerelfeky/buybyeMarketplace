// src/components/popups/EditItemContent.jsx
import React, { useState } from "react";
import "../../styles/seller/editItem.css";

export default function EditItemContent({ item, onClose, onSave }) {
  const [title, setTitle] = useState(item.title);
  const [price, setPrice] = useState(item.price !== undefined && item.price !== null ? String(item.price) : '');
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState(item.category || "Electronics");
  const [images, setImages] = useState(item.images || []);
  const [isSaving, setIsSaving] = useState(false);

  // Helper: file → base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

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

  const handleSave = () => {
    setIsSaving(true);

    // Combine existing images with new uploaded images
    // All images will be sent to backend for persistence
    const newImageObjects = images.filter(img => typeof img === 'object' && img.base64);
    const existingImageStrings = images.filter(img => typeof img === 'string');
    
    // Convert new image objects to base64 strings
    const newImageStrings = newImageObjects.map(img => img.base64);
    
    // All images as strings to send to backend
    const allImages = [...existingImageStrings, ...newImageStrings];

    // Normalize and round price to two decimals to avoid floating-point drift
    const normalizedPrice = Number.isFinite(Number(price)) ? Math.round(Number(price) * 100) / 100 : 0;

    const updatedItem = {
      ...item,
      title: title.trim(),
      price: normalizedPrice,
      description: description.trim(),
      category,
      images: allImages,  // Send all images (existing + new) to backend
    };

    setTimeout(() => {
      onSave?.(updatedItem);
      setIsSaving(false);
    }, 400);
  };

  return (
    <>
      <div className="ei-header">
        <h2 className="ei-title">Edit Item</h2>
      </div>

      <form
        className="ei-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/* Title */}
        <div className="ei-field">
          <label className="ei-label">Title</label>
          <input
            type="text"
            className="ei-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. iPhone 15 Pro Max 256GB"
            required
          />
        </div>

        {/* Price */}
        <div className="ei-field">
          <label className="ei-label">Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="ei-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="299.99"
            required
          />
        </div>

        {/* Category */}
        <div className="ei-field">
          <label className="ei-label">Category</label>
          <select
            className="ei-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Electronics</option>
            <option>Vehicles</option>
            <option>Fashion</option>
            <option>Home & Garden</option>
            <option>Sports</option>
            <option>Other</option>
          </select>
        </div>

        {/* Description */}
        <div className="ei-field">
          <label className="ei-label">Description</label>
          <textarea
            className="ei-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Include condition, specs, accessories, warranty info..."
            required
          />
        </div>

        {/* Images edit */}
        <div className="ei-field">
          <label className="ei-label">Images</label>

          <div className="ei-upload-area">
            <input
              type="file"
              multiple
              accept="image/*"
              className="ei-file-input"
              onChange={handleImageUpload}
            />
            <label className="ei-upload-label">
              <span className="ei-upload-icon">📸</span>
              <p className="ei-upload-hint">
                Add more photos or replace existing ones (up to 10 photos)
              </p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="ei-preview-grid">
              {images.map((img) => (
                <div key={img.id} className="ei-preview-img">
                  <img src={img.base64} alt="preview" />
                  <button
                    type="button"
                    className="ei-remove-img"
                    onClick={() => handleRemoveImage(img.id)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="ei-actions">
          <button
            type="button"
            className="ei-btn outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ei-btn primary"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
