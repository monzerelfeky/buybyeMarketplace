import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import WishlistProvider from "./components/WishlistProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <WishlistProvider>
      {({ favorites, toggleFavorite }) => (
        <App favorites={favorites} toggleFavorite={toggleFavorite} />
      )}
    </WishlistProvider>
  </BrowserRouter>
);