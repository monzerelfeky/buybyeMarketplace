// src/context/SellerContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from "react";

const SellerContext = createContext(null);

// ✅ Helper: Normalize item.images for UI display (supports Cloudinary objects + legacy strings)
function processItemImages(item, apiBase) {
  if (!item.images || item.images.length === 0) return item;

  const processedImages = item.images
    .map((img) => {
      // ✅ Cloudinary object: { url: "https://..." }
      if (typeof img === "object" && img?.url && typeof img.url === "string") {
        return img; // keep object as-is
      }

      // Legacy string
      if (typeof img === "string") {
        // Full URL
        if (img.startsWith("http://") || img.startsWith("https://")) return img;

        // Base64 data url
        if (img.startsWith("data:")) return img;

        // filename -> backend served uploads
        if (img) return `${apiBase}/uploads/images/${img}`;
      }

      return null;
    })
    .filter(Boolean);

  return { ...item, images: processedImages };
}

function getStoredSellerId() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id || parsed?._id || parsed?.userId || null;
  } catch (err) {
    console.warn("[SellerContext] Could not read seller id from storage", err.message);
    return null;
  }
}

function getAuthHeaders(includeJson = false) {
  const token = localStorage.getItem("authToken");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (includeJson) headers["Content-Type"] = "application/json";
  return headers;
}

// ✅ Detect Cloudinary images array
function isCloudinaryImages(images) {
  return (
    Array.isArray(images) &&
    images.length > 0 &&
    images.every((img) => img && typeof img === "object" && typeof img.url === "string")
  );
}

// ✅ Extract legacy/base64 strings if someone still sends localImages objects
function normalizeLegacyImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => (typeof img === "string" ? img : img?.base64 || ""))
    .filter(Boolean);
}

export function SellerProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [flags, setFlags] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState({ items: false, orders: false, flags: false, serviceAreas: false });
  const sellerIdRef = useRef(getStoredSellerId());

  const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Load items and orders from backend
  useEffect(() => {
    const abort = { ok: false };

    const fetchItems = async () => {
      const sellerId = sellerIdRef.current || getStoredSellerId();
      const qs = sellerId ? `?sellerId=${encodeURIComponent(sellerId)}` : "";
      console.debug("[SellerContext] fetching items from", `${API}/api/items${qs}`);
      setLoading((l) => ({ ...l, items: true }));
      try {
        const res = await fetch(`${API}/api/items${qs}`, { headers: getAuthHeaders() });
        console.debug("[SellerContext] items response status", res.status);
        if (!res.ok) throw new Error(`Failed to load items (status ${res.status})`);
        const data = await res.json();
        console.debug("[SellerContext] items payload", data && data.length ? `array(${data.length})` : data);

        if (!abort.ok && Array.isArray(data)) {
          const processed = data.map((it) => {
            const withId = { ...it, id: it._id || it.id };
            return processItemImages(withId, API);
          });
          setItems(processed);
        }
      } catch (err) {
        console.warn("[SellerContext] Could not fetch items:", err.message);
      } finally {
        setLoading((l) => ({ ...l, items: false }));
      }
    };

    const fetchOrders = async () => {
      const sellerId = sellerIdRef.current || getStoredSellerId();
      const qs = sellerId ? `?sellerId=${encodeURIComponent(sellerId)}` : "";
      console.debug("[SellerContext] fetching orders from", `${API}/api/orders${qs}`);
      setLoading((l) => ({ ...l, orders: true }));
      try {
        const res = await fetch(`${API}/api/orders${qs}`, { headers: getAuthHeaders() });
        console.debug("[SellerContext] orders response status", res.status);
        if (!res.ok) throw new Error(`Failed to load orders (status ${res.status})`);
        const data = await res.json();
        console.debug("[SellerContext] orders payload", data && data.length ? `array(${data.length})` : data);
        if (!abort.ok && Array.isArray(data)) setOrders(data.map((o) => ({ ...o, id: o._id || o.id })));
      } catch (err) {
        console.warn("[SellerContext] Could not fetch orders:", err.message);
      } finally {
        setLoading((l) => ({ ...l, orders: false }));
      }
    };

    fetchItems();
    fetchOrders();

    return () => {
      abort.ok = true;
    };
  }, [API]);

  // ---- ORDERS ----
  const updateOrder = async (orderId, updates) => {
    const backendUpdates = { ...updates };
    if (backendUpdates.tracking !== undefined && backendUpdates.trackingNo === undefined) {
      backendUpdates.trackingNo = backendUpdates.tracking;
      delete backendUpdates.tracking;
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...backendUpdates } : o)));

    try {
      const onlyStatus = backendUpdates.status && Object.keys(backendUpdates).length === 1;
      const url = onlyStatus ? `${API}/api/orders/${orderId}/status` : `${API}/api/orders/${orderId}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(onlyStatus ? { status: backendUpdates.status, note: backendUpdates.note || "" } : backendUpdates),
      });

      if (!res.ok) throw new Error(`Order update failed (${res.status})`);

      const data = await res.json();
      const normalized = { ...data, id: data._id || data.id };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? normalized : o)));
    } catch (err) {
      console.warn("Failed to update order on server", err.message);
    }
  };

  // ---- ITEMS ----
  // ✅ IMPORTANT: addItem must NOT convert Cloudinary images to base64
  const addItem = (item, imagesArg = []) => {
    (async () => {
      try {
        const sellerId = sellerIdRef.current || getStoredSellerId();
        console.debug("[SellerContext] Creating item:", item, "sellerId:", sellerId);

        // Prefer item.images (CreateItemContent should put Cloudinary images here)
        let finalImages = [];

        if (isCloudinaryImages(item.images)) {
          finalImages = item.images;
        } else if (isCloudinaryImages(imagesArg)) {
          finalImages = imagesArg;
        } else if (Array.isArray(item.images) && item.images.length > 0) {
          // legacy strings
          finalImages = normalizeLegacyImages(item.images);
        } else if (Array.isArray(imagesArg) && imagesArg.length > 0) {
          // legacy strings/base64 objects
          finalImages = normalizeLegacyImages(imagesArg);
        }

        const itemWithImages = {
          ...item,
          images: finalImages, // ✅ send Cloudinary objects or legacy strings
          seller: sellerId || item.seller || undefined,
          sellerId: sellerId || item.sellerId || undefined,
        };

        console.debug("[SellerContext] Payload images count:", Array.isArray(itemWithImages.images) ? itemWithImages.images.length : 0);
        console.debug("[SellerContext] Payload images sample:", itemWithImages.images?.[0]);

        const res = await fetch(`${API}/api/items`, {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify(itemWithImages),
        });

        const data = await res.json();
        console.debug("[SellerContext] Create response status:", res.status);
        console.debug("[SellerContext] Response data:", data);

        if (!res.ok) {
          throw new Error(`Server error: ${data.message || res.statusText}`);
        }

        const created = data;
        const itemForState = processItemImages({ ...created, id: created._id || created.id }, API);
        setItems((prev) => [itemForState, ...prev]);
      } catch (err) {
        console.error("[SellerContext] Create item failed:", err.message);
      }
    })();
  };

  // ✅ Update item without base64 conversion for Cloudinary
  const updateItem = async (itemId, updates) => {
    const { localImages, ...baseUpdates } = updates;

    let finalImages = undefined;

    // If updates.images are Cloudinary objects, keep them
    if (isCloudinaryImages(baseUpdates.images)) {
      finalImages = baseUpdates.images;
    } else if (Array.isArray(baseUpdates.images)) {
      // legacy strings
      finalImages = normalizeLegacyImages(baseUpdates.images);
    }

    // Merge in localImages only if they are legacy base64 objects (not Cloudinary)
    if (localImages && Array.isArray(localImages) && localImages.length > 0 && !isCloudinaryImages(localImages)) {
      const legacyLocal = normalizeLegacyImages(localImages);
      finalImages = [...(finalImages || []), ...legacyLocal].filter(Boolean);
    }

    const backendUpdates = {
      ...baseUpdates,
      ...(finalImages !== undefined ? { images: finalImages } : {}),
    };

    // optimistic update in state
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const merged = { ...it, ...updates };
          if (finalImages !== undefined) merged.images = finalImages;
          return merged;
        }
        return it;
      })
    );

    try {
      console.debug("[SellerContext] Updating item:", itemId, "images:", backendUpdates.images?.length || 0);
      const res = await fetch(`${API}/api/items/${itemId}`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(backendUpdates),
      });
      console.debug("[SellerContext] Update response status:", res.status);
      if (!res.ok) throw new Error(`Failed to update: ${res.status}`);

      const updated = await res.json();
      const itemForState = processItemImages({ ...updated, id: updated._id || updated.id }, API);
      setItems((prev) => prev.map((it) => (it.id === itemId ? itemForState : it)));
    } catch (err) {
      console.error("[SellerContext] Failed to update item on server:", err.message);
    }
  };

  const deleteItem = async (itemId) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    try {
      await fetch(`${API}/api/items/${itemId}`, { method: "DELETE", headers: getAuthHeaders() });
    } catch (err) {
      console.warn("Failed to delete item on server", err.message);
    }
  };

  const toggleItemStatus = async (itemId) => {
    const current = items.find((it) => it.id === itemId);
    const currentActive = current ? (typeof current.isActive === "boolean" ? current.isActive : current.status === "active") : false;
    const nextActive = !currentActive;
    updateItem(itemId, { isActive: nextActive });
  };

  // ---- FLAGS ----
  const fetchSellerFlags = async (sellerId = sellerIdRef.current || getStoredSellerId()) => {
    if (!sellerId) return;
    setLoading((l) => ({ ...l, flags: true }));
    try {
      const params = new URLSearchParams({ storeId: sellerId });
      const res = await fetch(`${API}/api/flags?${params.toString()}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load flags");
      if (Array.isArray(data)) {
        setFlags(data.map((f) => ({ ...f, id: f._id || f.id })));
      }
    } catch (err) {
      console.warn("[SellerContext] Could not fetch flags:", err.message);
    } finally {
      setLoading((l) => ({ ...l, flags: false }));
    }
  };

  const flagCustomer = async ({ orderId, itemId, reason }) => {
    if (!orderId || !itemId || !reason) return { error: "Missing order, item, or reason" };
    const sellerId = sellerIdRef.current || getStoredSellerId();
    const order = orders.find((o) => o.id === orderId || o._id === orderId);

    const payload = {
      orderId,
      itemId,
      reason,
      flaggedUserRole: "buyer",
      flaggedUserId: order?.buyerId || order?.buyer?._id,
      createdByUserId: sellerId || order?.sellerId,
    };

    setLoading((l) => ({ ...l, flags: true }));
    try {
      const res = await fetch(`${API}/api/flags`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not create flag");
      const normalized = { ...data, id: data._id || data.id };
      setFlags((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error("[SellerContext] Create flag failed:", err.message);
      return { error: err.message };
    } finally {
      setLoading((l) => ({ ...l, flags: false }));
    }
  };

  const updateFlagStatus = async (flagId, status, adminNotes = "") => {
    if (!flagId || !status) return { error: "Missing flag id or status" };
    setFlags((prev) => prev.map((f) => (f.id === flagId || f._id === flagId ? { ...f, status } : f)));
    try {
      const res = await fetch(`${API}/api/flags/${flagId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ status, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      const normalized = { ...data, id: data._id || data.id };
      setFlags((prev) => prev.map((f) => (f.id === flagId || f._id === flagId ? normalized : f)));
      return normalized;
    } catch (err) {
      console.warn("[SellerContext] Flag status update failed:", err.message);
      return { error: err.message };
    }
  };

  // ---- SERVICE AREAS ----
  const fetchServiceAreasForSeller = async (sellerId = sellerIdRef.current || getStoredSellerId()) => {
    if (!sellerId) return;
    setLoading((l) => ({ ...l, serviceAreas: true }));
    try {
      const res = await fetch(`${API}/api/sellers/${sellerId}/service-areas`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load service areas");
      setServiceAreas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("[SellerContext] Could not load service areas:", err.message);
    } finally {
      setLoading((l) => ({ ...l, serviceAreas: false }));
    }
  };

  const saveServiceAreas = async (areas = []) => {
    const sellerId = sellerIdRef.current || getStoredSellerId();
    if (!sellerId) return { error: "Missing seller id" };

    setLoading((l) => ({ ...l, serviceAreas: true }));
    try {
      const res = await fetch(`${API}/api/sellers/${sellerId}/service-areas`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ serviceAreas: areas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save service areas");
      setServiceAreas(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("[SellerContext] Save service areas failed:", err.message);
      return { error: err.message };
    } finally {
      setLoading((l) => ({ ...l, serviceAreas: false }));
    }
  };

  const refresh = () => {
    (async () => {
      setLoading((l) => ({ ...l, items: true, orders: true }));
      try {
        const sellerId = sellerIdRef.current || getStoredSellerId();
        if (sellerId && sellerIdRef.current !== sellerId) sellerIdRef.current = sellerId;
        const qs = sellerId ? `?sellerId=${encodeURIComponent(sellerId)}` : "";
        const [rit, ror] = await Promise.all([
          fetch(`${API}/api/items${qs}`, { headers: getAuthHeaders() }).then((r) => r.json()),
          fetch(`${API}/api/orders${qs}`, { headers: getAuthHeaders() }).then((r) => r.json()),
        ]);
        if (Array.isArray(rit)) setItems(rit.map((it) => processItemImages({ ...it, id: it._id || it.id }, API)));
        if (Array.isArray(ror)) setOrders(ror.map((o) => ({ ...o, id: o._id || o.id })));
      } catch (err) {
        console.warn("[SellerContext] refresh failed", err.message);
      } finally {
        setLoading((l) => ({ ...l, items: false, orders: false }));
      }
    })();

    const sellerId = sellerIdRef.current || getStoredSellerId();
    if (sellerId) {
      fetchSellerFlags(sellerId);
      fetchServiceAreasForSeller(sellerId);
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const nextSellerId = getStoredSellerId();
      if (nextSellerId) sellerIdRef.current = nextSellerId;
      refresh();
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refresh]);

  useEffect(() => {
    const stored = getStoredSellerId();
    const orderSeller = orders.find((o) => o?.sellerId)?.sellerId;
    const sellerId = stored || orderSeller;

    if (!sellerId) return;

    if (sellerIdRef.current !== sellerId) sellerIdRef.current = sellerId;

    if (sellerIdRef.current && (flags.length === 0 || serviceAreas.length === 0)) {
      fetchSellerFlags(sellerIdRef.current);
      fetchServiceAreasForSeller(sellerIdRef.current);
    }
  }, [orders, flags.length, serviceAreas.length]);

  const value = useMemo(
    () => ({
      orders,
      updateOrder,
      items,
      addItem,
      updateItem,
      deleteItem,
      toggleItemStatus,
      flags,
      flagCustomer,
      updateFlagStatus,
      reloadFlags: fetchSellerFlags,
      serviceAreas,
      saveServiceAreas,
      reloadServiceAreas: fetchServiceAreasForSeller,
      loading,
      refresh,
    }),
    [orders, items, flags, serviceAreas, loading]
  );

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error("useSeller must be used within a SellerProvider");
  return ctx;
}
