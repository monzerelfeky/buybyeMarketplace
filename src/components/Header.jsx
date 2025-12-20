  // src/components/Header.jsx
  import React, { useState, useEffect, useRef } from "react";
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
    const [currentUser, setCurrentUser] = useState(null);
    const lastInputAtRef = useRef(0);

    const location = useLocation();
    const navigate = useNavigate();

    const { addItem, refresh } = useSeller();
    const isCartPage = location.pathname === "/cart";

    // Check if user is logged in (re-evaluates when authRefresh changes)
    const isLoggedIn = !!localStorage.getItem('authToken');
    const isSeller = !!currentUser?.isSeller;

    const categories = ["Cars", "Sports & Fitness", "Electronics", "Home & Garden"];

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
      window.dispatchEvent(new Event('auth-changed'));
      setAuthRefresh((p) => p + 1);
      // Close any open panels
      setIsCartOpen(false);
      setIsSidePanelOpen(false);
    };

    // Keep header and seller context in sync when auth changes (storage or custom event)
    useEffect(() => {
      const loadUserFromStorage = () => {
        const raw = localStorage.getItem("user");
        if (!raw) {
          setCurrentUser(null);
          return;
        }
        try {
          setCurrentUser(JSON.parse(raw));
        } catch {
          setCurrentUser(null);
        }
      };

      const fetchUserFromApi = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setCurrentUser(null);
          return;
        }
        try {
          const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
          const res = await fetch(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Profile fetch failed");
          const data = await res.json();
          const stored = localStorage.getItem("user");
          const storedUser = stored ? JSON.parse(stored) : {};
          const nextUser = { ...storedUser, ...data };
          localStorage.setItem("user", JSON.stringify(nextUser));
          setCurrentUser(nextUser);
        } catch (err) {
          console.error("Failed to refresh user profile:", err);
        }
      };

      const handleAuthChange = () => {
        setAuthRefresh((p) => p + 1);
        refresh();
        loadUserFromStorage();
        fetchUserFromApi();
      };

      loadUserFromStorage();
      if (isLoggedIn) fetchUserFromApi();
      window.addEventListener("auth-changed", handleAuthChange);
      window.addEventListener("storage", handleAuthChange);
      return () => {
        window.removeEventListener("auth-changed", handleAuthChange);
        window.removeEventListener("storage", handleAuthChange);
      };
    }, [authRefresh, isLoggedIn, refresh]);

    // SEARCH HANDLERS
    const handleSearch = () => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;
      const isCategoryPage = location.pathname.startsWith("/category/");
      const targetPath = isCategoryPage ? location.pathname : "/category/all";
      const params = new URLSearchParams(isCategoryPage ? location.search : "");
      params.set("query", trimmed);
      navigate(`${targetPath}?${params.toString()}`);
    };

    const handleSearchKeyDown = (e) => {
      if (e.key === "Enter") handleSearch();
    };

    useEffect(() => {
      const isCategoryPage = location.pathname.startsWith("/category/");
      if (!isCategoryPage) return;

      const timeout = setTimeout(() => {
        const params = new URLSearchParams(location.search);
        const trimmed = searchQuery.trim();
        if (trimmed) {
          params.set("query", trimmed);
        } else {
          if (!params.get("query")) return;
          params.delete("query");
        }
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      }, 250);

      return () => clearTimeout(timeout);
    }, [location.pathname, location.search, navigate, searchQuery]);

    useEffect(() => {
      const isCategoryPage = location.pathname.startsWith("/category/");
      if (!isCategoryPage) return;
      const params = new URLSearchParams(location.search);
      const queryParam = params.get("query") || "";
      const timeSinceInput = Date.now() - lastInputAtRef.current;
      if (timeSinceInput < 300) return;
      if (queryParam !== searchQuery) {
        setSearchQuery(queryParam);
      }
    }, [location.pathname, location.search, searchQuery]);

  // Require login before allowing seller-only actions/navigation
  const ensureLoggedIn = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return false;
    }
    return true;
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
                  onChange={(e) => {
                    lastInputAtRef.current = Date.now();
                    setSearchQuery(e.target.value);
                  }}
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

                <button
                  className="post-btn"
                  onClick={() => {
                    if (!ensureLoggedIn()) return;
                    if (isSeller) {
                      navigate("/seller/dashboard");
                      return;
                    }
                    setIsBecomeSellerOpen(true);
                  }}
                >
                  Post Ad
                </button>

                {isLoggedIn && !isCartPage && (
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
                  onClick={() => {
                    if (!ensureLoggedIn()) return;
                    setIsCreateItemOpen(true);
                  }}
                >
                  + Create Item
                </button>
              </div>
            )}

           
        </div>

          {/* BUYER CATEGORIES */}
          {!isSellerPage && (
            <div className="categories-bar">
              {categories.map((cat) => {
                const slug = cat.toLowerCase().replace(/ /g, "-");
                const isActiveCategory = location.pathname === `/category/${slug}`;
                return (
                  <button 
                    key={cat} 
                    className={`category-btn${isActiveCategory ? " active" : ""}`}
                    onClick={() => navigate(`/category/${slug}`)}
                  >
                    {cat}
                  </button>
                );
              })}
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
          onBecomeSeller={() => {
            if (!ensureLoggedIn()) return;
            setIsBecomeSellerOpen(true);
          }}
          isLoggedIn={isLoggedIn}
          isSeller={isSeller}
        />

        {/* LOGIN MODAL */}
        <UniversalModal
          isOpen={isLoginOpen}
          onClose={() => {
            setIsLoginOpen(false);
            setAuthRefresh(prev => prev + 1); // trigger re-render to check auth state
            refresh();
          }}
          type="login"
        >
          <LoginContent onClose={() => {
            setIsLoginOpen(false);
            setAuthRefresh(prev => prev + 1);
            refresh();
          }} onLoginSuccess={() => {
            setAuthRefresh(prev => prev + 1);
            refresh();
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
          <BecomeSellerContent
            onConfirm={async () => {
              const token = localStorage.getItem("authToken");
              if (!token) return;
              try {
                const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
                const res = await fetch(`${API_BASE}/api/users/me/seller`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ isSeller: true }),
                });
                if (!res.ok) throw new Error("Failed to update seller status");
                const data = await res.json();
                const nextUser = { ...currentUser, ...data };
                localStorage.setItem("user", JSON.stringify(nextUser));
                setCurrentUser(nextUser);
                window.dispatchEvent(new Event("auth-changed"));
                setIsBecomeSellerOpen(false);
                navigate("/seller/dashboard");
              } catch (err) {
                console.error("Failed to activate seller account:", err);
              }
            }}
          />
        </UniversalModal>

        {!isCartPage && (
          <CartPanel 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />
        )}
      </>
    );
  }
