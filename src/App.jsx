// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";

// Seller pages (now in components)
import SellerDashboard from "./components/seller/SellerDashboard";
import SellerItems from "./components/seller/SellerItems";
import OrdersList from "./components/seller/OrdersList";
import SellerFlags from "./components/seller/SellerFlags";
import ServiceabilitySettings from "./components/seller/ServiceabilitySettings";

//Buyer Pages 
import BuyerProfileSettings from "./pages/BuyerProfileSettings";
import WishlistPage from "./pages/Buyer/WishlistPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// About
import OurStory from "./pages/about/OurStory";
import HowItWorks from "./pages/about/HowItWorks";
import TrustSafety from "./pages/about/TrustSafety";

// Policies
import ShippingPolicy from "./pages/policies/ShippingPolicy";
import ReturnPolicy from "./pages/policies/ReturnPolicy";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsOfService from "./pages/policies/TermsOfService";

// Support
import ContactUs from "./pages/support/ContactUs";
import FAQ from "./pages/support/FAQ";
import HelpCenter from "./pages/support/HelpCenter";

// Sell
import StartSelling from "./pages/sell/StartSelling";
import SellerGuide from "./pages/sell/SellerGuide";
import SellerFees from "./pages/sell/SellerFees";

//Cart Page
import CartPage from "./pages/Buyer/CartPage";

//Search Page

//Category Page
import CategoryPage from "./pages/Buyer/CategoryPage";

//Product Page
import ProductPage from "./pages/Buyer/ProductPage";

import { SellerProvider } from "./context/SellerContext";

//Checkout Page
import CheckoutPage from "./pages/CheckoutPage";

//OrderConfirmation Page
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

//OrderHistory Page
import OrderHistoryPage from "./pages/OrderHistoryPage";

//Report Seller Page
import ReportSeller from "./pages/ReportSeller";

//Order Tracking Page
import OrderTrackingPage from "./pages/OrderTrackingPage";

//Notifications Page
import NotificationsPage from "./pages/NotificationsPage";
import SellerNotificationsPage from "./pages/SellerNotificationsPage";

import ReportOrder from "./pages/ReportOrder";


export default function App() {
  return (
    <SellerProvider>
      <Routes>
        {/* Main */}
        <Route path="/" element={<HomePage />} />

        {/* About */}
        <Route path="/about/our-story" element={<OurStory />} />
        <Route path="/about/how-it-works" element={<HowItWorks />} />
        <Route path="/about/trust-safety" element={<TrustSafety />} />

        {/* Policies */}
        <Route path="/policies/shipping" element={<ShippingPolicy />} />
        <Route path="/policies/return" element={<ReturnPolicy />} />
        <Route path="/policies/privacy" element={<PrivacyPolicy />} />
        <Route path="/policies/terms" element={<TermsOfService />} />

        {/* Support */}
        <Route path="/support/contact" element={<ContactUs />} />
        <Route path="/support/faq" element={<FAQ />} />
        <Route path="/support/help" element={<HelpCenter />} />

        {/* Sell */}
        <Route path="/sell/start" element={<StartSelling />} />
        <Route path="/sell/guide" element={<SellerGuide />} />
        <Route path="/sell/fees" element={<SellerFees />} />

        {/* Cart Route */}
        <Route path="/cart" element={<CartPage />} />


        {/* Category Route */}
        <Route path="/category/:categoryName" element={<CategoryPage />} />

        {/* Product Route */}
        <Route path="/product/:productId" element={<ProductPage />} />
  
        {/* Seller area */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/items" element={<SellerItems />} />
        <Route path="/seller/orders" element={<OrdersList />} />
        <Route path="/seller/flags" element={<SellerFlags />} />
        <Route path="/seller/delivery" element={<ServiceabilitySettings />} />
        <Route path="/seller/notifications" element={<SellerNotificationsPage />} />

        {/* Buyer Routes*/}
        <Route path="/buyer/profile-settings" element={<BuyerProfileSettings />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/*Checkout Route*/}
        <Route path="/checkout" element={<CheckoutPage />} />

        {/*Order Confirmation Route*/}
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

        {/*Order History Route*/}
        <Route path="/order-history" element={<OrderHistoryPage />} />

        {/*Report Seller Route*/}
        <Route path="/report-seller" element={<ReportSeller />} />

        {/*Order Tracking Route*/}
        <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />

        {/*Notifications Route*/}
        <Route path="/notifications" element={<NotificationsPage />} />

       <Route path="/report-order" element={<ReportOrder />} />

      </Routes>
    </SellerProvider>
  );
}
