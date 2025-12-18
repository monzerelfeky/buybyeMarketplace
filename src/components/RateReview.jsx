import React, { useState } from "react";
import "../styles/RateReview.css";

const RateReview = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = () => {
    if (currentRating === 0 || currentText.trim() === "") {
      alert("Please provide a rating and review!");
      return;
    }

    if (editingId !== null) {
      // Update existing review
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, rating: currentRating, text: currentText } : r
        )
      );
      setEditingId(null);
    } else {
      // Add new review
      const newReview = {
        id: Date.now(), // simple unique id
        rating: currentRating,
        text: currentText,
      };
      setReviews((prev) => [...prev, newReview]);
    }

    // Reset input fields
    setCurrentRating(0);
    setCurrentText("");
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setCurrentRating(review.rating);
    setCurrentText(review.text);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="rate-review-container">
      {/* Left column: Review Form */}
      <div className="review-form">
        <h2>Rate & Review Product</h2>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hoverRating || currentRating) ? "filled" : ""}`}
              onClick={() => setCurrentRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Write your review..."
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
        />
        <button className="submit-btn" onClick={handleSubmit}>
          {editingId !== null ? "Update Review" : "Submit Review"}
        </button>
      </div>

      {/* Right column: Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="single-review">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= review.rating ? "filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p>{review.text}</p>
              <div className="review-actions">
                <button className="edit-btn" onClick={() => handleEdit(review)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(review.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RateReview;
