import { useState } from "react";

export default function WishlistProvider({ children }) {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return children({ favorites, toggleFavorite });
}
