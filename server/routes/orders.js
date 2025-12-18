const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Item = require('../models/Item');


const router = express.Router();

// Helper: transform order to include buyer info and enriched item details
async function transformOrder(order) {
  const orderObj = order.toObject ? order.toObject() : order;
  const items = Array.isArray(orderObj.items) ? orderObj.items : [];

  // Fetch item data (title, price...) with broader id support
  const itemIds = items
    .map((i) => i.itemId || i.productId || i._id || i.id)
    .filter(Boolean);
  const dbItems = itemIds.length
    ? await Item.find({ _id: { $in: itemIds } }).select("price title")
    : [];
  const dbIndex = new Map(dbItems.map((d) => [d._id.toString(), d]));

  // Pre-calc total qty for fallback price split
  const totalQty = items.reduce(
    (sum, it) =>
      sum +
      (Number(it.quantity) ||
        Number(it.qty) ||
        Number(it.count) ||
        0),
    0
  );

  const itemsWithPrice = items.map((itm, idx) => {
    const lookupId =
      itm.itemId || itm.productId || itm._id || itm.id;
    const match = lookupId ? dbIndex.get(String(lookupId)) : null;
    const qty =
      Number(itm.quantity) ||
      Number(itm.qty) ||
      Number(itm.count) ||
      0 ||
      1;
    const lineTotal =
      Number(itm.lineTotal) ||
      Number(itm.subtotal) ||
      Number(itm.total) ||
      0;
    const priceFromDb = match ? Number(match.price) || 0 : 0;
    const priceAtOrder =
      Number(itm.priceAtOrder) ||
      Number(itm.price) ||
      Number(itm.unitPrice) ||
      Number(itm.pricePerUnit) ||
      Number(itm.amount) ||
      Number(itm.item?.price) ||
      Number(itm.product?.price) ||
      priceFromDb ||
      (lineTotal && qty ? lineTotal / qty : 0) ||
      (orderObj.totalPrice && totalQty
        ? Number(orderObj.totalPrice) / totalQty
        : 0);

    const name =
      itm.name ||
      itm.title ||
      itm.itemName ||
      itm.productName ||
      itm.displayName ||
      itm.item?.title ||
      itm.product?.title ||
      (match ? match.title : null) ||
      "Unknown Item";

    return {
      ...itm,
      itemId: lookupId || itm.itemId,
      name,
      price: priceAtOrder,
      priceAtOrder,
      priceFromDb,
      quantity: qty,
    };
  });

  const recalcedTotal =
    typeof orderObj.totalPrice === "number"
      ? orderObj.totalPrice
      : Math.round(
          (itemsWithPrice.reduce(
            (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 0),
            0
          ) +
            Number.EPSILON) *
            100
        ) / 100;

  // Try to get buyer name, email, phone from User model if buyerId exists
  let buyerInfo = {
    name: "Unknown Buyer",
    email: "",
    phone: "",
  };

  if (orderObj.buyerId) {
    try {
      const buyer = await User.findById(orderObj.buyerId).select(
        "name email phone"
      );
      if (buyer) {
        buyerInfo.name = buyer.name || buyer.email || "Unknown Buyer";
        buyerInfo.email = buyer.email || "";
        buyerInfo.phone = buyer.phone || "";
      }
    } catch (err) {
      console.warn("Could not fetch buyer:", err.message);
    }
  }

  return {
    ...orderObj,
    items: itemsWithPrice,
    totalPrice: recalcedTotal,
    buyerName: buyerInfo.name,
    buyerEmail: buyerInfo.email,
    buyerPhone: buyerInfo.phone,
  };
}

// GET /api/orders - list recent orders with buyer names
router.get('/', async (req, res) => {
  try {
    const { sellerId, seller } = req.query;
    const filter = {};
    if (sellerId || seller) {
      filter.sellerId = sellerId || seller;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    const transformed = await Promise.all(orders.map(transformOrder));
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    const transformed = await transformOrder(order);
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

// POST /api/orders
// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { buyerId, sellerId, items = [], deliveryAddress, buyerNotes } = req.body;

    // Fetch item prices/titles and build snapshots
    const itemIds = items
      .map((i) => i.itemId || i.productId || i._id || i.id)
      .filter(Boolean);
    const dbItems = itemIds.length ? await Item.find({ _id: { $in: itemIds } }) : [];
    const dbIndex = new Map(dbItems.map((d) => [d._id.toString(), d]));

    const itemsSnapshot = items.map((orderItem, idx) => {
      const lookupId =
        orderItem.itemId || orderItem.productId || orderItem._id || orderItem.id;
      const match = lookupId ? dbIndex.get(String(lookupId)) : null;
      const qty = Number(orderItem.quantity) || Number(orderItem.qty) || 0;
      const priceAtOrder =
        match ? Number(match.price) || 0 : Number(orderItem.price) || Number(orderItem.unitPrice) || 0;

      return {
        itemId: lookupId,
        quantity: qty,
        price: priceAtOrder,
        priceAtOrder,
        name: match?.title || orderItem.name || orderItem.productName || orderItem.title || `Item ${idx + 1}`,
      };
    });

    const totalPrice = Math.round(
      (itemsSnapshot.reduce((sum, it) => sum + (Number(it.priceAtOrder) || 0) * (it.quantity || 0), 0) +
        Number.EPSILON) *
        100
    ) / 100;

    const order = await Order.create({
      buyerId,
      sellerId,
      items: itemsSnapshot,
      totalPrice,
      deliveryAddress,
      buyerNotes,
      placedAt: new Date()
    });

    const transformed = await transformOrder(order);
    res.status(201).json(transformed);
    
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not create order' });
  }
});


// PATCH update status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status, changedAt: new Date(), note });
    order.updatedAt = new Date();
    await order.save();
    const transformed = await transformOrder(order);
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

// PATCH update order fields (items, deliveryAddress, buyerNotes, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });

    console.debug('Updating order', req.params.id, 'with fields:', Object.keys(req.body));

    // If items are provided, recalculate totalPrice using current Item prices and store snapshots
    if (req.body.items) {
      const itemsPayload = Array.isArray(req.body.items) ? req.body.items : [];
      const itemIds = itemsPayload
        .map((i) => i.itemId || i.productId || i._id || i.id)
        .filter(Boolean);
      const dbItems = itemIds.length
        ? await Item.find({ _id: { $in: itemIds } }).select('price title')
        : [];
      const dbIndex = new Map(dbItems.map((d) => [d._id.toString(), d]));

      const normalizedItems = itemsPayload.map((orderItem, idx) => {
        const lookupId =
          orderItem.itemId || orderItem.productId || orderItem._id || orderItem.id;
        const match = lookupId ? dbIndex.get(String(lookupId)) : null;
        const qty = Number(orderItem.quantity) || Number(orderItem.qty) || 0;
        const priceAtOrder =
          match ? Number(match.price) || 0 : Number(orderItem.price) || Number(orderItem.unitPrice) || 0;

        return {
          itemId: lookupId,
          quantity: qty,
          price: priceAtOrder,
          priceAtOrder,
          name: match?.title || orderItem.name || orderItem.productName || orderItem.title || `Item ${idx + 1}`,
        };
      });

      const totalPrice = Math.round(
        (normalizedItems.reduce((sum, it) => sum + (Number(it.priceAtOrder) || 0) * (it.quantity || 0), 0) +
          Number.EPSILON) *
          100
      ) / 100;

      order.items = normalizedItems;
      order.totalPrice = totalPrice; // round to 2 decimals
    }

    // Update other updatable fields
    const updatable = ['deliveryAddress', 'buyerNotes', 'deliveryNotes', 'payment', 'trackingNo', 'orderNo', 'status'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) order[k] = req.body[k];
    });

    order.updatedAt = new Date();
    await order.save();
    const transformed = await transformOrder(order);
    res.json(transformed);
  } catch (err) {
    console.error('Order update error:', err.message);
    res.status(400).json({ message: 'Bad request' });
  }
});

module.exports = router;
