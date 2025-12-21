import React, { useEffect, useState } from "react";
import "../styles/RateReview.css";

const RateReview = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("");

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

  useEffect(() => {
    let isMounted = true;

    const checkEligibility = async () => {
      if (!productId) return;
      if (!userId) {
        if (!isMounted) return;
        setCanReview(false);
        setEligibilityMessage("Login to review this product.");
        return;
      }

      setEligibilityLoading(true);
      setEligibilityMessage("");
      try {
        const res = await fetch(
          `${API_BASE}/api/orders?buyerId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) throw new Error("Failed to check orders");
        const data = await res.json();
        const eligible = Array.isArray(data)
          ? data.some(
              (order) =>
                order.status === "Delivered" &&
                Array.isArray(order.items) &&
                order.items.some(
                  (item) =>
                    String(item.itemId || item._id || item.id) ===
                    String(productId)
                )
            )
          : false;
        if (!isMounted) return;
        setCanReview(eligible);
        setEligibilityMessage(
          eligible ? "" : "You can review this product after delivery."
        );
      } catch (err) {
        if (!isMounted) return;
        setCanReview(false);
        setEligibilityMessage("Unable to verify review eligibility.");
      } finally {
        if (isMounted) setEligibilityLoading(false);
      }
    };

    checkEligibility();
    return () => {
      isMounted = false;
    };
  }, [API_BASE, productId, userId]);

  // Submit new review
  const handleSubmit = async () => {
    if (!canReview) {
      alert("You can only review items from delivered orders.");
      return;
    }
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
        {eligibilityMessage ? (
          <p style={{ marginBottom: "12px", color: "#6b7280" }}>
            {eligibilityMessage}
          </p>
        ) : null}
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hoverRating || currentRating) ? "filled" : ""}`}
              onClick={() => canReview && setCurrentRating(star)}
              onMouseEnter={() => canReview && setHoverRating(star)}
              onMouseLeave={() => canReview && setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Write your review..."
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          disabled={!canReview || eligibilityLoading}
        />
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!canReview || eligibilityLoading}
        >
          {eligibilityLoading ? "Checking..." : "Submit Review"}
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
                  <span
                    key={star}
                    className={`star ${star <= review.rating ? "filled" : ""}`}
                  >
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
