const Order = require('../models/Order');
const {
  transformOrder,
  buildItemSnapshots,
  computeTotal,
} = require('../services/orderService');

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { sellerId, seller, buyerId } = req.query;
    const filter = {};
    if (sellerId || seller) {
      filter.sellerId = sellerId || seller;
    }
    if (buyerId) {
      filter.buyerId = buyerId;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    const transformed = await Promise.all(orders.map(transformOrder));
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    const transformed = await transformOrder(order);
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { buyerId, sellerId, items = [], deliveryAddress, buyerNotes } = req.body;

    const itemsSnapshot = await buildItemSnapshots(items);
    const totalPrice = computeTotal(itemsSnapshot);

    const order = await Order.create({
      buyerId,
      sellerId,
      items: itemsSnapshot,
      totalPrice,
      deliveryAddress,
      buyerNotes,
      placedAt: new Date(),
    });

    const transformed = await transformOrder(order);
    res.status(201).json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not create order' });
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
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
};

// PATCH /api/orders/:id
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });

    console.debug('Updating order', req.params.id, 'with fields:', Object.keys(req.body));

    if (req.body.items) {
      const itemsPayload = Array.isArray(req.body.items) ? req.body.items : [];
      const normalizedItems = await buildItemSnapshots(itemsPayload);
      const totalPrice = computeTotal(normalizedItems);
      order.items = normalizedItems;
      order.totalPrice = totalPrice;
    }

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
};
