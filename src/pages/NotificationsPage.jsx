import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/NotificationsPage.css";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  // Get logged-in user's ID from localStorage
  const USER_ID = JSON.parse(localStorage.getItem("user"))?._id;

  useEffect(() => {
    if (!USER_ID) {
      setServerError("User not logged in");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setServerError("");
      try {
        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/notifications?userId=${USER_ID}`);
        const data = await res.json();

        if (!res.ok) {
          setServerError(data.message || "Failed to fetch notifications");
          setNotifications([]);
        } else {
          setNotifications(data);
        }
      } catch (err) {
        console.error("Fetch notifications error:", err);
        setServerError("Network error. Please try again.");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [USER_ID]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );

    // Optional: update backend to mark as read
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
      await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <>
      <Header />

      <div className="notifications-container">
        <h2 className="notifications-title">Notifications & Inbox</h2>

        {loading ? (
          <p>Loading notifications...</p>
        ) : serverError ? (
          <p className="form-error">{serverError}</p>
        ) : notifications.length === 0 ? (
          <p className="empty-state">No notifications available.</p>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${
                  notification.isRead ? "read" : "unread"
                }`}
                onClick={() => markAsRead(notification._id)}
              >
                <div className="notification-header">
                  <span className={`badge ${notification.type}`}>
                    {notification.type}
                  </span>
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="notification-title">
                  {notification.data?.title || notification.type}
                </h4>

                <p className="notification-message">
                  {notification.data?.message || ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
