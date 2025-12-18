// src/context/SellerContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from "react";

const SellerContext = createContext(null);

// Helper: Convert image filenames to URLs
function processItemImages(item, apiBase) {
  if (!item.images || item.images.length === 0) return item;
  
  const processedImages = item.images.map(img => {
    // If already a full URL, keep it
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      return img;
    }
    // If it's a filename, convert to URL
    if (typeof img === 'string' && img && !img.startsWith('data:')) {
      return `${apiBase}/uploads/images/${img}`;
    }
    // If it's a base64 data URL, keep as is (for local preview)
    return img;
  });
  
  return { ...item, images: processedImages };
}

function getStoredSellerId() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id || parsed?._id || parsed?.userId || null;
  } catch (err) {
    console.warn('[SellerContext] Could not read seller id from storage', err.message);
    return null;
  }
}

export function SellerProvider({ children }) {
  // start with empty lists; populate from backend on mount
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [flags, setFlags] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState({ items: false, orders: false, flags: false, serviceAreas: false });
  const sellerIdRef = useRef(getStoredSellerId());

  // Base API — use absolute URL since proxy may not be configured
  const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  // Load items and orders from backend
  useEffect(() => {
      const abort = { ok: false };
  
    const fetchItems = async () => {
      const sellerId = sellerIdRef.current || getStoredSellerId();
      const qs = sellerId ? `?sellerId=${encodeURIComponent(sellerId)}` : '';
      console.debug('[SellerContext] fetching items from', `${API}/api/items${qs}`);
      setLoading((l) => ({ ...l, items: true }));
      try {
        const res = await fetch(`${API}/api/items${qs}`);
        console.debug('[SellerContext] items response status', res.status);
        if (!res.ok) throw new Error(`Failed to load items (status ${res.status})`);
        const data = await res.json();
          console.debug('[SellerContext] items payload', data && data.length ? `array(${data.length})` : data);
          if (!abort.ok && Array.isArray(data)) {
            const processed = data.map((it) => {
              const withId = { ...it, id: it._id || it.id };
              return processItemImages(withId, API);
            });
            setItems(processed);
          }
        } catch (err) {
          console.warn('[SellerContext] Could not fetch items:', err.message);
        } finally {
          setLoading((l) => ({ ...l, items: false }));
        }
      };
  
    const fetchOrders = async () => {
      const sellerId = sellerIdRef.current || getStoredSellerId();
      const qs = sellerId ? `?sellerId=${encodeURIComponent(sellerId)}` : '';
      console.debug('[SellerContext] fetching orders from', `${API}/api/orders${qs}`);
      setLoading((l) => ({ ...l, orders: true }));
      try {
        const res = await fetch(`${API}/api/orders${qs}`);
        console.debug('[SellerContext] orders response status', res.status);
          if (!res.ok) throw new Error(`Failed to load orders (status ${res.status})`);
          const data = await res.json();
          console.debug('[SellerContext] orders payload', data && data.length ? `array(${data.length})` : data);
          if (!abort.ok && Array.isArray(data)) setOrders(data.map((o) => ({ ...o, id: o._id || o.id })));
        } catch (err) {
          console.warn('[SellerContext] Could not fetch orders:', err.message);
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
    // Normalize keys for backend (tracking -> trackingNo, etc.)
    const backendUpdates = { ...updates };
    if (backendUpdates.tracking !== undefined && backendUpdates.trackingNo === undefined) {
      backendUpdates.trackingNo = backendUpdates.tracking;
      delete backendUpdates.tracking;
    }

    // optimistic
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...backendUpdates } : o)));

    try {
      const onlyStatus = backendUpdates.status && Object.keys(backendUpdates).length === 1;
      const url = onlyStatus
        ? `${API}/api/orders/${orderId}/status`
        : `${API}/api/orders/${orderId}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          onlyStatus
            ? { status: backendUpdates.status, note: backendUpdates.note || '' }
            : backendUpdates
        )
      });

      if (!res.ok) throw new Error(`Order update failed (${res.status})`);

      const data = await res.json();
      const normalized = { ...data, id: data._id || data.id };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? normalized : o)));
    } catch (err) {
      console.warn('Failed to update order on server', err.message);
    }
  };

  // ---- ITEMS ----
  const addItem = (item, images = []) => {
    (async () => {
      try {
        const sellerId = sellerIdRef.current || getStoredSellerId();
        console.debug('[SellerContext] Creating item:', item, 'sellerId:', sellerId);
        
        // Convert images to base64 strings if they're objects with base64 property
        const imageStrings = images.map(img => 
          typeof img === 'string' ? img : (img.base64 || '')
        ).filter(img => img); // filter out empty strings
        
        const itemWithImages = {
          ...item,
          images: imageStrings,  // Send actual base64 images to backend
          seller: sellerId || undefined,
          sellerId: sellerId || undefined
        };
        
        console.debug('[SellerContext] Payload with', imageStrings.length, 'images');
        const res = await fetch(`${API}/api/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemWithImages)
        });
        console.debug('[SellerContext] Create response status:', res.status);
        
        // Parse response body ONCE
        const data = await res.json();
        console.debug('[SellerContext] Response data:', data);
        
        if (!res.ok) {
          throw new Error(`Server error: ${data.message || res.statusText}`);
        }
        
        const created = data;
        console.debug('[SellerContext] Item created with _id:', created._id, 'images:', created.images?.length || 0);
        // Add item to state with images URLs
        const itemForState = processItemImages({ ...created, id: created._id || created.id }, API);
        console.debug('[SellerContext] Adding to state:', itemForState.id);
        setItems((prev) => [itemForState, ...prev]);
        console.debug('[SellerContext] Item added to state successfully');
      } catch (err) {
        console.error('[SellerContext] Create item failed:', err.message);
      }
    })();
  };

  const updateItem = async (itemId, updates) => {
    // Extract localImages and convert all images to base64 strings for backend
    const { localImages, ...baseUpdates } = updates;
    
    // Merge DB images with new local images
    const allImages = [
      ...(baseUpdates.images || []),  // DB images (already strings)
      ...(localImages ? localImages.map(img => typeof img === 'string' ? img : (img.base64 || '')) : [])  // New images
    ].filter(img => img);  // Remove empty strings
    
    const backendUpdates = {
      ...baseUpdates,
      images: allImages  // Send all images (DB + new) to backend
    };
    
    // optimistic update in state
    setItems((prev) => prev.map((it) => {
      if (it.id === itemId) {
        return {
          ...it,
          ...updates,  // Keep localImages in state for display
          images: allImages  // Update with merged images
        };
      }
      return it;
    }));
    
    try {
      console.debug('[SellerContext] Updating item:', itemId, 'with', allImages.length, 'images');
      const res = await fetch(`${API}/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendUpdates)
      });
      console.debug('[SellerContext] Update response status:', res.status);
      if (!res.ok) {
        throw new Error(`Failed to update: ${res.status}`);
      }
      const updated = await res.json();
      console.debug('[SellerContext] Item updated in DB:', updated._id, 'with', updated.images?.length || 0, 'images');
      // Update state with DB response and process image URLs
      const itemForState = processItemImages({ ...updated, id: updated._id || updated.id }, API);
      setItems((prev) => prev.map((it) => (it.id === itemId ? itemForState : it)));
    } catch (err) {
      console.error('[SellerContext] Failed to update item on server:', err.message);
    }
  };

  const deleteItem = async (itemId) => {
    // optimistic
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    try {
      await fetch(`${API}/api/items/${itemId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete item on server', err.message);
    }
  };

  const toggleItemStatus = async (itemId) => {
    const current = items.find((it) => it.id === itemId);
    // Prefer boolean isActive on the model; fall back to string status for older objects
    const currentActive = current ? (typeof current.isActive === 'boolean' ? current.isActive : (current.status === 'active')) : false;
    const nextActive = !currentActive;
    // Send boolean field to backend
    updateItem(itemId, { isActive: nextActive });
  };

  // ---- FLAGS ----
  const fetchSellerFlags = async (sellerId = sellerIdRef.current || getStoredSellerId()) => {
    if (!sellerId) return;
    setLoading((l) => ({ ...l, flags: true }));
    try {
      const params = new URLSearchParams({ storeId: sellerId });
      const res = await fetch(`${API}/api/flags?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load flags');
      if (Array.isArray(data)) {
        setFlags(data.map((f) => ({ ...f, id: f._id || f.id })));
      }
    } catch (err) {
      console.warn('[SellerContext] Could not fetch flags:', err.message);
    } finally {
      setLoading((l) => ({ ...l, flags: false }));
    }
  };

  const flagCustomer = async ({ orderId, reason }) => {
    if (!orderId || !reason) return { error: 'Missing order or reason' };
    const sellerId = sellerIdRef.current || getStoredSellerId();
    const order = orders.find((o) => (o.id === orderId || o._id === orderId));

    const payload = {
      orderId,
      reason,
      flaggedUserRole: 'buyer',
      flaggedUserId: order?.buyerId || order?.buyer?._id,
      createdByUserId: sellerId || order?.sellerId,
    };

    setLoading((l) => ({ ...l, flags: true }));
    try {
      const res = await fetch(`${API}/api/flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not create flag');
      const normalized = { ...data, id: data._id || data.id };
      setFlags((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error('[SellerContext] Create flag failed:', err.message);
      return { error: err.message };
    } finally {
      setLoading((l) => ({ ...l, flags: false }));
    }
  };

  const updateFlagStatus = async (flagId, status, adminNotes = '') => {
    if (!flagId || !status) return { error: 'Missing flag id or status' };
    setFlags((prev) =>
      prev.map((f) => (f.id === flagId || f._id === flagId ? { ...f, status } : f))
    );
    try {
      const res = await fetch(`${API}/api/flags/${flagId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      const normalized = { ...data, id: data._id || data.id };
      setFlags((prev) => prev.map((f) => (f.id === flagId || f._id === flagId ? normalized : f)));
      return normalized;
    } catch (err) {
      console.warn('[SellerContext] Flag status update failed:', err.message);
      return { error: err.message };
    }
  };

  // ---- SERVICE AREAS ----
  const fetchServiceAreasForSeller = async (sellerId = sellerIdRef.current || getStoredSellerId()) => {
    if (!sellerId) return;
    setLoading((l) => ({ ...l, serviceAreas: true }));
    try {
      const res = await fetch(`${API}/api/sellers/${sellerId}/service-areas`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load service areas');
      setServiceAreas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[SellerContext] Could not load service areas:', err.message);
    } finally {
      setLoading((l) => ({ ...l, serviceAreas: false }));
    }
  };

  const saveServiceAreas = async (areas = []) => {
    const sellerId = sellerIdRef.current || getStoredSellerId();
    if (!sellerId) return { error: 'Missing seller id' };

    setLoading((l) => ({ ...l, serviceAreas: true }));
    try {
      const res = await fetch(`${API}/api/sellers/${sellerId}/service-areas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceAreas: areas })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save service areas');
      setServiceAreas(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('[SellerContext] Save service areas failed:', err.message);
      return { error: err.message };
    } finally {
      setLoading((l) => ({ ...l, serviceAreas: false }));
    }
  };

  // allow manual refresh from UI/devtools
  const refresh = () => {
    (async () => {
      setLoading((l) => ({ ...l, items: true, orders: true }));
      try {
        const sellerId = sellerIdRef.current || getStoredSellerId();
        const qs = sellerId ? `?sellerId=${encodeURIComponent(sellerId)}` : '';
        const [rit, ror] = await Promise.all([
          fetch(`${API}/api/items${qs}`).then((r) => r.json()),
          fetch(`${API}/api/orders${qs}`).then((r) => r.json())
        ]);
        if (Array.isArray(rit)) setItems(rit.map((it) => ({ ...it, id: it._id || it.id })));
        if (Array.isArray(ror)) setOrders(ror.map((o) => ({ ...o, id: o._id || o.id })));
      } catch (err) {
        console.warn('[SellerContext] refresh failed', err.message);
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

  // Derive seller id once we have either auth data or orders
  useEffect(() => {
    const stored = getStoredSellerId();
    const orderSeller = orders.find((o) => o?.sellerId)?.sellerId;
    const sellerId = stored || orderSeller;

    if (!sellerId) return;

    if (sellerIdRef.current !== sellerId) {
      sellerIdRef.current = sellerId;
    }

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

  return (
    <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
  );
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) {
    throw new Error("useSeller must be used within a SellerProvider");
  }
  return ctx;
}

