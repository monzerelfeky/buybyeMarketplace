import React, { useState } from "react";
import "../styles/SidePanel.css";

export default function SidePanel({
  isOpen,
  onClose,
  sellerMode = false,
  navigate,
  onCreateItem,
  onBecomeSeller,
  isLoggedIn = false,
}) {
  const categoryList = [
    "Electronics",
    "Home & Garden",
    "Sports & Fitness",
    "Cars",
  ];

  // Return backdrop only when closed but still visible for fade animation
  if (!isOpen) {
    return <div className="side-panel-backdrop" />;
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/"; // redirect to homepage
  };

  return (
    <div
      className={`side-panel-backdrop ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className={`side-panel ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="side-panel-close" onClick={onClose}>
          ✕
        </button>

        <div className="side-panel-content">
          <h3>Menu</h3>

          {/* ============================  
                 SELLER MODE  
             ============================ */}
          {sellerMode ? (
            <>
              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/");
                  onClose();
                }}
              >
                Switch to Buyer
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/seller/dashboard");
                  onClose();
                }}
              >
                Dashboard
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/seller/items");
                  onClose();
                }}
              >
                Your Items
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/seller/orders");
                  onClose();
                }}
              >
                Orders
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/seller/notifications");
                  onClose();
                }}
              >
                Notifications
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/seller/flags");
                  onClose();
                }}
              >
                Flags
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/seller/delivery");
                  onClose();
                }}
              >
                Delivery Settings
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/buyer/profile-settings", {
                    state: { fromSeller: true },
                  });
                  onClose();
                }}
              >
                Edit Profile
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  if (onCreateItem) onCreateItem();
                  onClose();
                }}
              >
                + Create Item
              </button>

              {isLoggedIn && (
                <div className="bps-logout-wrapper">
                  <button className="bps-btn logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ============================  
                       BUYER MODE  
               ============================ */
            <>
              {/* Guest + Logged-in can see */}
              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/");
                  onClose();
                }}
              >
                Home
              </button>

              <button
                className="side-panel-link"
                onClick={() => {
                  navigate("/wishlist");
                  onClose();
                }}
              >
                Wishlist
              </button>

              {/* Only logged-in users should see these */}
              {isLoggedIn && (
                <>
                  <button
                    className="side-panel-link"
                    onClick={() => {
                      navigate("/order-history");
                      onClose();
                    }}
                  >
                    My Orders
                  </button>

                  <button
                    className="side-panel-link"
                    onClick={() => {
                      navigate("/notifications");
                      onClose();
                    }}
                  >
                    Notifications
                  </button>

                  <button
                    className="side-panel-link"
                    onClick={() => {
                      navigate("/buyer/profile-settings", {
                        state: { fromSeller: false },
                      });
                      onClose();
                    }}
                  >
                    Edit Profile
                  </button>
                </>
              )}

              {/* Guest + Logged-in can see */}
              <button
                className="side-panel-link"
                onClick={() => {
                  if (onBecomeSeller) onBecomeSeller();
                  onClose();
                }}
              >
                Become a Seller
              </button>

              <hr />

              <p className="side-panel-section-title">Categories</p>

              {/* CATEGORY BUTTONS - No Subcategories */}
              {categoryList.map((category) => (
                <button
                  key={category}
                  className="side-panel-link"
                  onClick={() => {
                    navigate(
                      `/category/${category.toLowerCase().replace(/ /g, "-")}`
                    );
                    onClose();
                  }}
                >
                  {category}
                </button>
              ))}

              <hr />

              {isLoggedIn && (
                <div className="bps-logout-wrapper">
                  <button className="bps-btn logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}