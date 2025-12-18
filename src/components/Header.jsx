  // src/components/Header.jsx
  import React, { useState } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import "../styles/Header.css";
  import UniversalModal from "./popups/UniversalModal";
  import LoginContent from "./popups/LoginContent";
  import CreateItemContent from "./popups/CreateItemContent";
  import BecomeSellerContent from "./popups/BecomeSellerContent";
  import SidePanel from "./SidePanel";
  import CartPanel from "./CartPanel";
  import { FiShoppingBag } from "react-icons/fi";
  import { useSeller } from "../context/SellerContext";

  export default function Header() {
    // STATE
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isBecomeSellerOpen, setIsBecomeSellerOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [authRefresh, setAuthRefresh] = useState(0); // trigger re-render after login

    const location = useLocation();
    const navigate = useNavigate();

    const { addItem } = useSeller();

    // Check if user is logged in (re-evaluates when authRefresh changes)
    const isLoggedIn = !!localStorage.getItem('authToken');

    const categories = ["Cars", "Real Estate", "Mobiles", "Jobs", "Electronics", "Home & Garden"];

    // IMPORTANT FIX → Profile stays buyer unless it's under /seller
    // Detect if coming from seller
    const cameFromSeller = location.state?.fromSeller === true;

    // Determine header mode
    const isSellerPage = cameFromSeller || location.pathname.startsWith("/seller");


    const closeSidePanel = () => setIsSidePanelOpen(false);

    const handleLogout = () => {
      // Clear auth data and trigger re-render
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
      setAuthRefresh((p) => p + 1);
      // Close any open panels
      setIsCartOpen(false);
      setIsSidePanelOpen(false);
    };

    // SEARCH HANDLERS
    const handleSearch = () => {
      if (!searchQuery.trim()) return;
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    };

    const handleSearchKeyDown = (e) => {
      if (e.key === "Enter") handleSearch();
    };

    return (
      <>
        <header className={`header ${isSellerPage ? "seller-mode" : ""}`}>
          <div className="header-inner">
            <div className="header-left">
              {/* Left side : MENU + LOGO */}
              <button className="menu-btn" onClick={() => setIsSidePanelOpen(true)}>☰</button>
              <div className="logo-box" onClick={() => navigate("/")}></div>
            </div>

            {/* BUYER SEARCH BAR */}
            {!isSellerPage && (
              <div className={`header-search-wrapper ${isLoggedIn ? 'logged-in' : ''}`}>
                <input
                  type="text"
                  className="header-search-input"
                  placeholder="Search marketplace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />

                <button className="header-search-btn" onClick={handleSearch}>
                  Search
                </button>
              </div>
            )}

            {/* BUYER ACTIONS */}
            {!isSellerPage && (
              <div className="header-actions">

                {!isLoggedIn && (
                  <button className="login-btn" onClick={() => setIsLoginOpen(true)}>
                    Login
                  </button>
                )}

                <button className="post-btn" onClick={() => setIsBecomeSellerOpen(true)}>
                  Post Ad
                </button>

                {isLoggedIn && (
                  <>
                    <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
                      <FiShoppingBag className="cart-icon" />
                    </button>
                  </>
                ) }
              </div>
            )}

            {/* SELLER ACTIONS */}
            {isSellerPage && (
              <div className="header-actions seller-actions">
                <button className="back-to-buyer-btn" onClick={() => navigate("/")}>
                  Switch to Buyer
                </button>

                <button
                  className="seller-create-btn"
                  onClick={() => setIsCreateItemOpen(true)}
                >
                  + Create Item
                </button>
              </div>
            )}

           
        </div>

          {/* BUYER CATEGORIES */}
          {!isSellerPage && (
            <div className="categories-bar">
              {categories.map((cat) => (
                <button 
                  key={cat} 
                  className="category-btn"
                  onClick={() =>
                    navigate(`/category/${cat.toLowerCase().replace(/ /g, "-")}`)
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* SELLER TOP NAV */}
          {isSellerPage && (
            <div className="seller-top-nav">
              <button
                className={`seller-nav-btn ${location.pathname === "/seller/dashboard" ? "active" : ""}`}
                onClick={() => navigate("/seller/dashboard")}
              >
                Dashboard
              </button>

              <button
                className={`seller-nav-btn ${location.pathname === "/seller/items" ? "active" : ""}`}
                onClick={() => navigate("/seller/items")}
              >
                Your Items
              </button>

              <button
                className={`seller-nav-btn ${location.pathname === "/seller/orders" ? "active" : ""}`}
                onClick={() => navigate("/seller/orders")}
              >
                Orders
              </button>

              <button
                className={`seller-nav-btn ${location.pathname === "/seller/flags" ? "active" : ""}`}
                onClick={() => navigate("/seller/flags")}
              >
                Flags
              </button>

              <button
                className={`seller-nav-btn ${location.pathname === "/seller/delivery" ? "active" : ""}`}
                onClick={() => navigate("/seller/delivery")}
              >
                Delivery
              </button>
            </div>
          )}

        </header>

        {/* SIDE PANEL */}
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={closeSidePanel}
          sellerMode={isSellerPage}
          navigate={navigate}
          categories={categories}
          onCreateItem={() => setIsCreateItemOpen(true)}
          onBecomeSeller={() => setIsBecomeSellerOpen(true)}
        />

        {/* LOGIN MODAL */}
        <UniversalModal
          isOpen={isLoginOpen}
          onClose={() => {
            setIsLoginOpen(false);
            setAuthRefresh(prev => prev + 1); // trigger re-render to check auth state
          }}
          type="login"
        >
          <LoginContent onClose={() => {
            setIsLoginOpen(false);
            setAuthRefresh(prev => prev + 1);
          }} />
        </UniversalModal>

        {/* CREATE ITEM MODAL */}
        <UniversalModal
          isOpen={isCreateItemOpen}
          onClose={() => setIsCreateItemOpen(false)}
          type="create-item"
        >
          <CreateItemContent
            onSave={(item, images) => {
              // ✅ now receives item and local images
              addItem(item, images);
              setIsCreateItemOpen(false);
            }}
            onClose={() => setIsCreateItemOpen(false)}
          />
        </UniversalModal>

        {/* BECOME SELLER MODAL */}
        <UniversalModal
          isOpen={isBecomeSellerOpen}
          onClose={() => setIsBecomeSellerOpen(false)}
          type="become-seller"
        >
          <BecomeSellerContent onConfirm={() => navigate("/seller/dashboard")} />
        </UniversalModal>

        <CartPanel 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      </>
    );
  }
