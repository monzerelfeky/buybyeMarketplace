const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export async function getWishlist() {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/api/wishlist`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch wishlist");
  return res.json();
}

export async function addToWishlist(itemId) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/api/wishlist/${itemId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to add to wishlist");
  return res.json();
}

export async function removeFromWishlist(itemId) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/api/wishlist/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to remove from wishlist");
  return res.json();
}
