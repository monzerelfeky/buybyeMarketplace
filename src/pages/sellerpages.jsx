import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import  SellerDashboard  from "../components/SellerDashboard";
import  SellerItems  from "../components/SellerItems";
import  OrdersList  from "../components/OrdersList";
import  OrderDetail  from "../components/OrderDetail";


export default function SellerApp() {
  return (
    <Router>
      <div className="seller-layout">

       
      
        {/* MAIN CONTENT */}
        <main className="page-content">
          <Routes>
            <Route path="/" element={<SellerDashboard />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/selleritems" element={<SellerItems />} />
            <Route path="/seller/orders" element={<OrdersList />} />
            <Route path="/seller/order/:id" element={<OrderDetail />} />

            {/* Catch-all to prevent white screen */}
            <Route path="*" element={<SellerDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
