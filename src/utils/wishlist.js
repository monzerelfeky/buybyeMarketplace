const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// ============================================
// LOCAL STORAGE FUNCTIONS (for guest users)
// ============================================

export function getLocalWishlist() {
  try {
    const wishlist = localStorage.getItem("guestWishlist");
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (err) {
    console.error("Error reading local wishlist:", err);
    return [];
  }
}

export function addToLocalWishlist(itemId) {
  try {
    const wishlist = getLocalWishlist();
    if (!wishlist.includes(itemId)) {
      wishlist.push(itemId);
      localStorage.setItem("guestWishlist", JSON.stringify(wishlist));
    }
    return wishlist;
  } catch (err) {
    console.error("Error adding to local wishlist:", err);
    return [];
  }
}

export function removeFromLocalWishlist(itemId) {
  try {
    const wishlist = getLocalWishlist();
    const updated = wishlist.filter(id => id !== itemId);
    localStorage.setItem("guestWishlist", JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error removing from local wishlist:", err);
    return [];
  }
}

export function clearLocalWishlist() {
  try {
    localStorage.removeItem("guestWishlist");
  } catch (err) {
    console.error("Error clearing local wishlist:", err);
  }
}

// ============================================
// DATABASE FUNCTIONS (for logged in users)
// ============================================

export async function getWishlist() {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Not authenticated");
  
  const res = await fetch(`${API_BASE}/api/wishlist`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (res.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Session expired. Please login again.");
  }
  
  if (!res.ok) throw new Error("Failed to fetch wishlist");
  return res.json();
}

export async function addToWishlist(itemId) {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Not authenticated");
  
  const res = await fetch(`${API_BASE}/api/wishlist/${itemId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (res.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Session expired. Please login again.");
  }
  
  if (!res.ok) throw new Error("Failed to add to wishlist");
  return res.json();
}

export async function removeFromWishlist(itemId) {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Not authenticated");
  
  const res = await fetch(`${API_BASE}/api/wishlist/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (res.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Session expired. Please login again.");
  }
  
  if (!res.ok) throw new Error("Failed to remove from wishlist");
  return res.json();
}

// ============================================
// MERGE FUNCTION (called after login)
// ============================================

export async function mergeLocalWishlistToDatabase() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.log("No token found, skipping wishlist merge");
    return;
  }

  const localWishlist = getLocalWishlist();
  if (localWishlist.length === 0) {
    console.log("No local wishlist items to merge");
    return;
  }

  console.log(`Merging ${localWishlist.length} items from local wishlist to database...`);

  try {
    // Add all local items to database
    let successCount = 0;
    let failCount = 0;

    for (const itemId of localWishlist) {
      try {
        await addToWishlist(itemId);
        successCount++;
        console.log(` Added item ${itemId} to database`);
      } catch (err) {
        failCount++;
        console.error(`Failed to add item ${itemId}:`, err.message);
      }
    }

    console.log(`Wishlist merge complete: ${successCount} succeeded, ${failCount} failed`);

    // Clear local wishlist after successful merge
    clearLocalWishlist();
    console.log("Local wishlist cleared");
  } catch (err) {
    console.error("Error merging wishlist:", err);
  }
}