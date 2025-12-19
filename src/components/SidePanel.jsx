import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import "../styles/SidePanel.css";

export default function SidePanel({
  isOpen,
  onClose,
  sellerMode = false,
  navigate,
  onCreateItem,
  onBecomeSeller,
  isLoggedIn = false,
  isSeller = false,
}) {
  // Hooks MUST always be at the top
  const [openCategory, setOpenCategory] = useState(null);

  const categoryList = [
    { name: "Cars", sub: ["Sedan", "SUV", "Truck"] },
    { name: "Real Estate", sub: ["Apartments", "Houses", "Land"] },
    { name: "Mobiles", sub: ["iPhone", "Samsung", "Others"] },
    { name: "Jobs", sub: ["Full-Time", "Part-Time", "Freelance"] },
    { name: "Electronics", sub: ["TVs", "Laptops", "Audio"] },
    { name: "Home & Garden", sub: ["Furniture", "Decor", "Garden"] },
  ];

  const toggleCategory = (cat) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  // Return backdrop only when closed but still visible for fade animation
  if (!isOpen) {
    return <div className="side-panel-backdrop" />;
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedEmail");
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

              {/* keep only ONE notifications entry */}
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
              {!isSeller && (
                <button
                  className="side-panel-link"
                  onClick={() => {
                    if (onBecomeSeller) onBecomeSeller();
                    onClose();
                  }}
                >
                  Become a Seller
                </button>
              )}

              {isSeller && (
                <button
                  className="side-panel-link"
                  onClick={() => {
                    navigate("/seller/dashboard");
                    onClose();
                  }}
                >
                  Seller Dashboard
                </button>
              )}

              <hr />

              <p className="side-panel-section-title">Categories</p>

              {/* CATEGORY DROPDOWN UI */}
              {categoryList.map((cat) => {
                const isOpenCategory = openCategory === cat.name;

                return (
                  <div
                    key={cat.name}
                    className={`category-wrapper ${isOpenCategory ? "open" : ""}`}
                  >
                    <button
                      className="side-panel-link category-header-btn"
                      onClick={() => toggleCategory(cat.name)}
                    >
                      <span>{cat.name}</span>

                      <span className="arrow-icon">
                        {isOpenCategory ? (
                          <FiChevronUp size={18} />
                        ) : (
                          <FiChevronDown size={18} />
                        )}
                      </span>
                    </button>

                    {isOpenCategory && (
                      <div className="subcategory-wrapper">
                        {cat.sub.map((sub) => (
                          <button
                            key={sub}
                            className="side-panel-link subcategory-btn"
                            onClick={() => {
                              navigate(
                                `/category/${cat.name
                                  .toLowerCase()
                                  .replace(/ /g, "-")}?subcategory=${sub
                                  .toLowerCase()
                                  .replace(/ /g, "-")}`
                              );
                              onClose();
                            }}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

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
