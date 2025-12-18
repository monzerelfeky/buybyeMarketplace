const express = require('express');
const Item = require('../models/Item');
const Order = require('../models/Order');
const { processImages, deleteImages } = require('../utils/imageHandler');

const router = express.Router();

// Helper: recalculates totalPrice for all orders containing a specific item
async function recalcOrdersForItem(itemId) {
  try {
    const orders = await Order.find({ 'items.itemId': itemId });
    if (!orders || orders.length === 0) return;

    for (const order of orders) {
      const itemIds = order.items.map(i => i.itemId);
      const dbItems = await Item.find({ _id: { $in: itemIds } }).select('price');

      let totalPrice = 0;
      order.items.forEach(orderItem => {
        const match = dbItems.find(d => d._id.toString() === (orderItem.itemId || '').toString());
        const qty = Number(orderItem.quantity) || 0;
        const price = match ? (Number(match.price) || 0) : 0;
        totalPrice += price * qty;
      });

      order.totalPrice = Math.round((totalPrice + Number.EPSILON) * 100) / 100;
      order.updatedAt = new Date();
      await order.save();
      console.debug(`Recalculated order ${order._id} totalPrice -> ${order.totalPrice}`);
    }
  } catch (err) {
    console.error('Failed to recalc orders for item', itemId, err.message);
  }
}

// GET /api/items
// Optional filter by sellerId to return only that seller's items
router.get('/', async (req, res) => {
  try {
    const { sellerId, seller } = req.query;
    const filter = {};
    if (sellerId || seller) {
      filter.seller = sellerId || seller;
    }

    const items = await Item.find(filter).limit(100);
    res.json(items);
  } catch (err) {
    console.error('Failed to fetch items', err.message);
    res.status(400).json({ message: 'Bad request' });
  }
});

// POST /api/items (simple - no auth)
router.post('/', async (req, res) => {
  try {
    console.debug('Creating item with fields:', Object.keys(req.body));
    if (req.body.images) {
      console.debug('Images count:', req.body.images.length, 'Total size:', req.body.images.reduce((sum, img) => sum + (typeof img === 'string' ? img.length : 0), 0), 'bytes');
    }

    // Process images: convert base64 to filenames
    const processedImages = req.body.images ? processImages(req.body.images) : [];
    const itemData = {
      ...req.body,
      images: processedImages, // Store filenames, not base64
    };

    // Ensure seller is linked to the logged-in user (when provided by frontend)
    if (req.body.sellerId || req.body.seller) {
      itemData.seller = req.body.sellerId || req.body.seller;
    }

    // Normalize numeric fields to avoid string/float precision issues
    if (itemData.price !== undefined) {
      const p = Number(itemData.price);
      itemData.price = Number.isFinite(p) ? Math.round(p * 100) / 100 : 0;
    }
    if (itemData.quantity !== undefined) {
      itemData.quantity = Number(itemData.quantity) || 0;
    }

    const item = new Item(itemData);
    await item.save();
    // Recalculate orders that reference this item (newly-created item unlikely present, but safe)
    try { await recalcOrdersForItem(item._id); } catch (e) { console.debug('recalcOrdersForItem post-create failed', e.message); }
    res.status(201).json(item);
  } catch (err) {
    console.error('Item creation error:', err.message, err.errors);
    res.status(400).json({ message: 'Bad request', error: err.message, details: err.errors });
  }
});

// PATCH /api/items/:id
router.patch('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    
    console.debug('Updating item', req.params.id, 'with fields:', Object.keys(req.body));
    
    // Process images if provided
    if (req.body.images) {
      console.debug('Images count:', req.body.images.length, 'Total size:', req.body.images.reduce((sum, img) => sum + (typeof img === 'string' ? img.length : 0), 0), 'bytes');
      
      // Delete old images if they're being replaced
      const oldFilenames = item.images || [];
      const newFilenames = processImages(req.body.images);
      
      // Find images to delete (old ones not in new list)
      const toDelete = oldFilenames.filter(old => !newFilenames.includes(old));
      deleteImages(toDelete);
      
      req.body.images = newFilenames;
    }
    // Normalize numeric fields before assigning
    if (req.body.price !== undefined) {
      const p = Number(req.body.price);
      req.body.price = Number.isFinite(p) ? Math.round(p * 100) / 100 : 0;
      console.debug('Normalized price for update:', req.body.price);
    }
    if (req.body.quantity !== undefined) {
      req.body.quantity = Number(req.body.quantity) || 0;
      console.debug('Normalized quantity for update:', req.body.quantity);
    }

    Object.assign(item, req.body);
    item.updatedAt = new Date();
    await item.save();
    // If price changed (or quantity), recalc affected orders
    try { await recalcOrdersForItem(item._id); } catch (e) { console.debug('recalcOrdersForItem post-update failed', e.message); }
    res.json(item);
  } catch (err) {
    console.error('Item update error:', err.message, err.errors);
    res.status(400).json({ message: 'Bad request', error: err.message });
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    
    // Delete associated images
    if (item.images && item.images.length > 0) {
      deleteImages(item.images);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

module.exports = router;
