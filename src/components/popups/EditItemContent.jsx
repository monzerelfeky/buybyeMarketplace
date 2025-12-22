// src/components/popups/EditItemContent.jsx
import React, { useState } from "react";
import "../../styles/seller/editItem.css";

export default function EditItemContent({ item, onClose, onSave }) {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // ✅ Upload multiple files -> returns [{url, publicId, ...}]
  const uploadImagesToCloudinary = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const res = await fetch(`${API_BASE}/api/upload/listing-images`, {
      method: "POST",
      body: formData,
      // do NOT set Content-Type manually
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = data?.message || "Image upload failed";
      throw new Error(msg);
    }

    // Expect: { images: [{ url, publicId, ... }] }
    return Array.isArray(data?.images) ? data.images : [];
  };

  const normalizeInitialImages = (imgs = []) =>
    (imgs || [])
      .map((img, idx) => {
        // DB might return either string URLs or {url, publicId}
        const url = typeof img === "string" ? img : img?.url || "";
        if (!url) return null;

        return {
          id: img?.publicId || img?.id || `existing-${idx}`,
          url,
          publicId: typeof img === "object" ? img?.publicId : undefined,
          preview: url,
          uploading: false,
        };
      })
      .filter(Boolean);

  const [title, setTitle] = useState(item.title || "");
  const [price, setPrice] = useState(
    item.price !== undefined && item.price !== null ? String(item.price) : ""
  );
  const [quantity, setQuantity] = useState(
    item.quantity !== undefined && item.quantity !== null ? String(item.quantity) : ""
  );
  const [description, setDescription] = useState(item.description || "");
  const [category, setCategory] = useState(item.category || "Electronics");
  const [images, setImages] = useState(() => normalizeInitialImages(item.images));
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 10 - images.length;
    const toUpload = files.slice(0, remainingSlots);

    // Temp previews while uploading
    const temp = toUpload.map((file) => ({
      id: `temp-${Math.random().toString(36).slice(2)}`,
      url: "",
      publicId: undefined,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setImages((prev) => [...prev, ...temp]);

    try {
      const uploaded = await uploadImagesToCloudinary(toUpload); // [{url, publicId, ...}]

      setImages((prev) => {
        const copy = [...prev];

        // remove temp items and cleanup blob URLs
        for (const t of temp) {
          const idx = copy.findIndex((x) => x.id === t.id);
          if (idx !== -1) {
            try {
              if (copy[idx]?.preview?.startsWith("blob:")) {
                URL.revokeObjectURL(copy[idx].preview);
              }
            } catch (_) {}
            copy.splice(idx, 1);
          }
        }

        // add uploaded cloudinary images
        const normalizedUploaded = (uploaded || [])
          .map((u, i) => {
            const url = u?.url;
            if (!url) return null;
            return {
              id: u?.publicId || `cloud-${Date.now()}-${i}`,
              url,
              publicId: u?.publicId,
              preview: url,
              uploading: false,
            };
          })
          .filter(Boolean);

        return [...copy, ...normalizedUploaded].slice(0, 10);
      });
    } catch (err) {
      console.error(err);
      // Remove temp uploading entries on failure
      setImages((prev) => prev.filter((img) => !img.uploading));
      alert(err?.message || "Image upload failed.");
    } finally {
      // allow selecting same file again
      e.target.value = "";
    }
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const removed = prev.find((x) => x.id === id);
      if (removed?.preview?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(removed.preview);
        } catch (_) {}
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSave = () => {
    setIsSaving(true);

    // ✅ Send as Cloudinary objects [{url, publicId}]
    // This matches your backend `isCloudinaryImages` check (objects with url). :contentReference[oaicite:1]{index=1}
    const cloudinaryImages = images
      .filter((img) => !img.uploading)
      .map((img) => ({
        url: img.url,
        ...(img.publicId ? { publicId: img.publicId } : {}),
      }))
      .filter((x) => !!x.url);

    const normalizedPrice = Number.isFinite(Number(price))
      ? Math.round(Number(price) * 100) / 100
      : 0;

    const updatedItem = {
      ...item,
      title: title.trim(),
      price: normalizedPrice,
      quantity: Number.isFinite(Number(quantity)) ? Number(quantity) : 0,
      description: description.trim(),
      category,
      images: cloudinaryImages, // ✅ objects only
    };

    setTimeout(() => {
      onSave?.(updatedItem);
      setIsSaving(false);
    }, 250);
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
        <div className="ei-field">
          <label className="ei-label">Title</label>
          <input
            type="text"
            className="ei-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="ei-field">
          <label className="ei-label">Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="ei-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="ei-field">
          <label className="ei-label">Quantity</label>
          <input
            type="number"
            min="0"
            step="1"
            className="ei-input"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="ei-field">
          <label className="ei-label">Category</label>
          <select
            className="ei-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Electronics</option>
            <option>Cars</option>
            <option>Fashion</option>
            <option>Home & Garden</option>
            <option>Sports & Fitness</option>
            
          </select>
        </div>

        <div className="ei-field">
          <label className="ei-label">Description</label>
          <textarea
            className="ei-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            required
          />
        </div>

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
                <div key={img.id || img.url} className="ei-preview-img">
                  <img src={img.preview || img.url} alt="preview" />
                  <button
                    type="button"
                    className="ei-remove-img"
                    onClick={() => handleRemoveImage(img.id)}
                    disabled={img.uploading}
                    title={img.uploading ? "Uploading..." : "Remove"}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
            disabled={isSaving || images.some((x) => x.uploading)}
            title={images.some((x) => x.uploading) ? "Wait for uploads to finish" : "Save"}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
