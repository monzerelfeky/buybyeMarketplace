const Item = require('../models/Item');
const { processImages, deleteImages } = require('../utils/imageHandler');
const { recalcOrdersForItem } = require('../services/itemService');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/items
exports.listItems = async (req, res) => {
  try {
    const { sellerId, seller, query, category } = req.query;
    const filter = {};
    if (sellerId || seller) {
      filter.seller = sellerId || seller;
    }
    if (category) {
      filter.category = category;
    }

    if (query) {
      const safe = escapeRegex(query.trim());
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { category: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const items = await Item.find(filter).limit(100);
    res.json(items);
  } catch (err) {
    console.error('Failed to fetch items', err.message);
    res.status(400).json({ message: 'Bad request' });
  }
};

// GET /api/items/suggestions?query=...
exports.getSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) return res.json([]);

    const safe = escapeRegex(query.trim());
    const matches = await Item.find({
      $or: [
        { title: { $regex: safe, $options: "i" } },
        { category: { $regex: safe, $options: "i" } },
      ],
    })
      .select("title category")
      .limit(20)
      .lean();

    const suggestions = [];
    const seen = new Set();
    for (const item of matches) {
      if (item.title && !seen.has(item.title)) {
        seen.add(item.title);
        suggestions.push(item.title);
      }
      if (item.category && !seen.has(item.category)) {
        seen.add(item.category);
        suggestions.push(item.category);
      }
    }

    res.json(suggestions.slice(0, 10));
  } catch (err) {
    console.error('Failed to fetch suggestions', err.message);
    res.status(400).json({ message: 'Bad request' });
  }
};

// POST /api/items
exports.createItem = async (req, res) => {
  try {
    console.debug('Creating item with fields:', Object.keys(req.body));
    if (req.body.images) {
      console.debug(
        'Images count:',
        req.body.images.length,
        'Total size:',
        req.body.images.reduce((sum, img) => sum + (typeof img === 'string' ? img.length : 0), 0),
        'bytes'
      );
    }

    const processedImages = req.body.images ? processImages(req.body.images) : [];
    const itemData = {
      ...req.body,
      images: processedImages,
    };

    if (itemData.price !== undefined) {
      const p = Number(itemData.price);
      itemData.price = Number.isFinite(p) ? Math.round(p * 100) / 100 : 0;
    }
    if (itemData.quantity !== undefined) {
      itemData.quantity = Number(itemData.quantity) || 0;
    }

    if (req.body.sellerId || req.body.seller) {
      itemData.seller = req.body.sellerId || req.body.seller;
    }

    const item = new Item(itemData);
    await item.save();
    try {
      await recalcOrdersForItem(item._id);
    } catch (e) {
      console.debug('recalcOrdersForItem post-create failed', e.message);
    }
    res.status(201).json(item);
  } catch (err) {
    console.error('Item creation error:', err.message, err.errors);
    res.status(400).json({ message: 'Bad request', error: err.message, details: err.errors });
  }
};

// PATCH /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    console.debug('Updating item', req.params.id, 'with fields:', Object.keys(req.body));

    if (req.body.images) {
      console.debug(
        'Images count:',
        req.body.images.length,
        'Total size:',
        req.body.images.reduce((sum, img) => sum + (typeof img === 'string' ? img.length : 0), 0),
        'bytes'
      );

      const oldFilenames = item.images || [];
      const newFilenames = processImages(req.body.images);

      const toDelete = oldFilenames.filter((old) => !newFilenames.includes(old));
      deleteImages(toDelete);

      req.body.images = newFilenames;
    }

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
    try {
      await recalcOrdersForItem(item._id);
    } catch (e) {
      console.debug('recalcOrdersForItem post-update failed', e.message);
    }
    res.json(item);
  } catch (err) {
    console.error('Item update error:', err.message, err.errors);
    res.status(400).json({ message: 'Bad request', error: err.message });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    if (item.images && item.images.length > 0) {
      deleteImages(item.images);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};
