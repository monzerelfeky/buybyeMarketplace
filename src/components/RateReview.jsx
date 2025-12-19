import React, { useEffect, useState } from "react";
import "../styles/RateReview.css";

const RateReview = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const userId = localStorage.getItem("userId");

  // Fetch username for a given userId
  const fetchUserName = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return data.name || "Anonymous";
    } catch (err) {
      console.error(err);
      return "Anonymous";
    }
  };

  // Fetch comments for the product
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/comments/product/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();

      // Fetch author names for each comment
      const reviewsWithNames = await Promise.all(
        data.map(async (comment) => {
          const authorName = await fetchUserName(comment.authorId);
          return { ...comment, authorName };
        })
      );

      setReviews(reviewsWithNames);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  // Submit new review
  const handleSubmit = async () => {
    if (currentRating === 0 || currentText.trim() === "") {
      alert("Please provide a rating and review!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: productId,
          type: "product",
          text: currentText,
          rating: currentRating,
          authorId: userId,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      const newComment = await res.json();

      // Fetch author name for the new comment
      const authorName = await fetchUserName(newComment.authorId);

      setReviews((prev) => [{ ...newComment, authorName }, ...prev]);
      setCurrentText("");
      setCurrentRating(0);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
  };

  return (
    <div className="rate-review-container">
      {/* Review Form */}
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
          Submit Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="single-review">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`star ${star <= review.rating ? "filled" : ""}`}>
                    ★
                  </span>
                ))}
              </div>
              <p>{review.text}</p>
              <small>By: {review.authorName}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RateReview;
