const express = require('express');
const Flag = require('../models/Flag');
const Order = require('../models/Order');
const { enforceFlagPolicy } = require('../utils/flagsEnforcer');

const router = express.Router();

// Helper to load order details for enrichment
async function deriveIdsFromOrder(orderId, payload) {
  if (!orderId) return payload;

  try {
    const order = await Order.findById(orderId).select('buyerId sellerId');
    if (!order) return payload;

    // Auto-attach buyer/seller IDs if caller omitted them
    if (!payload.flaggedUserId) {
      if (payload.flaggedUserRole === 'buyer') payload.flaggedUserId = order.buyerId;
      if (payload.flaggedUserRole === 'seller') payload.flaggedUserId = order.sellerId;
    }
    if (!payload.createdByUserId && payload.flaggedUserRole === 'buyer') {
      payload.createdByUserId = order.sellerId;
    }
    if (!payload.createdByUserId && payload.flaggedUserRole === 'seller') {
      payload.createdByUserId = order.buyerId;
    }
  } catch (err) {
    console.warn('Could not derive IDs from order', orderId, err.message);
  }

  return payload;
}


// Create a flag
router.post('/', async (req, res) => {
  try {
    const payload = {
      status: 'pending',
      flaggedUserRole: req.body.flaggedUserRole || 'buyer',
      ...req.body,
    };

    if (payload.orderId) {
      await deriveIdsFromOrder(payload.orderId, payload);
    }

    payload.updatedAt = new Date();

    const f = new Flag(payload);
    await f.save();
    // Auto-enforce policy on the flagged user
    try { await enforceFlagPolicy(f.flaggedUserId, f.flaggedUserRole); } catch (e) { console.warn('Policy enforcement failed:', e.message); }
    res.status(201).json(f);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

// List flags with filtering
router.get('/', async (req, res) => {
  try {
    const { flaggedUserId, createdByUserId, flaggedUserRole, orderId, status, storeId } = req.query;
    const filter = {};

    if (flaggedUserId) filter.flaggedUserId = flaggedUserId;
    if (createdByUserId) filter.createdByUserId = createdByUserId;
    if (flaggedUserRole) filter.flaggedUserRole = flaggedUserRole;
    if (orderId) filter.orderId = orderId;
    if (status) filter.status = status;

    // Convenience: fetch everything related to a seller (flags raised against them OR by them)
    if (storeId) {
      filter.$or = [
        { flaggedUserId: storeId },
        { createdByUserId: storeId }
      ];
    }

    const query = Flag.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('orderId', 'orderNo status buyerId sellerId placedAt')
      .populate('flaggedUserId', 'name email')
      .populate('createdByUserId', 'name email');

    const flags = await query;
    res.json(flags);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

// Update status / notes
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const flag = await Flag.findById(req.params.id);
    if (!flag) return res.status(404).json({ message: 'Not found' });

    if (status) flag.status = status;
    if (adminNotes !== undefined) flag.adminNotes = adminNotes;
    flag.updatedAt = new Date();

    await flag.save();
    // Re-evaluate policy on status change
    try { await enforceFlagPolicy(flag.flaggedUserId, flag.flaggedUserRole); } catch (e) { console.warn('Policy enforcement failed:', e.message); }
    res.json(flag);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

module.exports = router;
