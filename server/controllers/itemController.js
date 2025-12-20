const mongoose = require('mongoose');
const Item = require('../models/Item');
const Comment = require('../models/Comment');
const { processImages, deleteImages } = require('../utils/imageHandler');
const { recalcOrdersForItem } = require('../services/itemService');
const { summarizeReviews } = require('../services/aiReviewSummaryService');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Detect Cloudinary-style images:
 * [{ url: "https://res.cloudinary.com/..." , publicId?: "...", ... }]
 */
const isCloudinaryImages = (images) => {
  if (!Array.isArray(images) || images.length === 0) return false;
  return images.every(
    (img) => img && typeof img === "object" && typeof img.url === "string" && img.url.length > 0
  );
};

const isStringImages = (images) => {
  if (!Array.isArray(images) || images.length === 0) return false;
  return images.every((img) => typeof img === "string");
};

// Normalize various image inputs into the schema shape [{ url: string }]
const toImageDocs = (images) => {
  if (!Array.isArray(images)) return [];

  return images
    .map((img) => {
      if (img && typeof img === "object" && typeof img.url === "string" && img.url) {
        return { url: img.url };
      }
      if (typeof img === "string" && img) {
        return { url: img };
      }
      return null;
    })
    .filter(Boolean);
};

// GET /api/items
exports.listItems = async (req, res) => {
  try {
    const { sellerId, seller, query, category } = req.query;
    const filter = {};
    if (sellerId || seller) {
      filter.seller = sellerId || seller;
    }
    if (category) {
      const normalized = category.toLowerCase().replace(/\s+/g, " ").trim();
      if (
        normalized === "sports & fitness" ||
        normalized === "sports&fitness" ||
        normalized === "sports fitness"
      ) {
        filter.category = {
          $in: [/^sports\s*&\s*fitness$/i, /^sports$/i],
        };
      } else {
        filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
      }
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
    console.error("Failed to fetch items", err.message);
    res.status(400).json({ message: "Bad request" });
  }
};

// GET /api/items/:id
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    console.error("Failed to fetch item", err.message);
    res.status(400).json({ message: "Bad request" });
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
    console.error("Failed to fetch suggestions", err.message);
    res.status(400).json({ message: "Bad request" });
  }
};

// POST /api/items
exports.createItem = async (req, res) => {
  try {
    console.debug("Creating item with fields:", Object.keys(req.body));

    if (req.body.images) {
      console.debug(
        "Images count:",
        Array.isArray(req.body.images) ? req.body.images.length : "not-array",
        "Type of first:",
        Array.isArray(req.body.images) && req.body.images.length ? typeof req.body.images[0] : "n/a"
      );
    }

    let finalImages = [];

    // ✅ Cloudinary images: keep as-is
    if (isCloudinaryImages(req.body.images)) {
      finalImages = req.body.images;
    }
    // ✅ Legacy images: strings -> process to filenames
    else if (isStringImages(req.body.images)) {
      finalImages = processImages(req.body.images);
    }
    // If images exists but doesn't match either, ignore to avoid breaking
    else {
      finalImages = [];
    }

    const itemData = {
      ...req.body,
      images: toImageDocs(finalImages),
    };

    // normalize price/quantity
    if (itemData.price !== undefined) {
      const p = Number(itemData.price);
      itemData.price = Number.isFinite(p) ? Math.round(p * 100) / 100 : 0;
    }
    if (itemData.quantity !== undefined) {
      itemData.quantity = Number(itemData.quantity) || 0;
    }

    // seller mapping
    if (req.body.sellerId || req.body.seller) {
      itemData.seller = req.body.sellerId || req.body.seller;
    }

    const item = new Item(itemData);
    await item.save();

    try {
      await recalcOrdersForItem(item._id);
    } catch (e) {
      console.debug("recalcOrdersForItem post-create failed", e.message);
    }

    res.status(201).json(item);
  }  catch (err) {
  console.error("CREATE ITEM ERROR (raw):", err);
  console.error("name:", err?.name);
  console.error("message:", err?.message);
  console.error("errors:", err?.errors);
  console.error("stack:", err?.stack);

  return res.status(400).json({
    message: "Create item failed",
    name: err?.name,
    error: err?.message,
    details: err?.errors || null,
  });
  }   // ✅ CLOSE catch
};    // ✅ CLOSE function


// PATCH /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });

    console.debug("Updating item", req.params.id, "with fields:", Object.keys(req.body));

    if (req.body.images) {
      console.debug(
        "Update images count:",
        Array.isArray(req.body.images) ? req.body.images.length : "not-array",
        "Type of first:",
        Array.isArray(req.body.images) && req.body.images.length ? typeof req.body.images[0] : "n/a"
      );

      // ✅ Cloudinary: just store objects (do NOT delete local files)
      if (isCloudinaryImages(req.body.images)) {
        req.body.images = req.body.images;
      }
      // ✅ Legacy: strings -> filenames, delete removed files
      else if (isStringImages(req.body.images)) {
        const oldFilenames = Array.isArray(item.images) ? item.images.filter((x) => typeof x === "string") : [];
        const newFilenames = processImages(req.body.images);

        const toDelete = oldFilenames.filter((old) => !newFilenames.includes(old));
        deleteImages(toDelete);

        req.body.images = newFilenames;
      } else {
        // Unknown shape, ignore to avoid wiping existing images
        delete req.body.images;
      }
    }
    if (req.body.images) {
      req.body.images = toImageDocs(req.body.images);
    }

    // normalize price/quantity
    if (req.body.price !== undefined) {
      const p = Number(req.body.price);
      req.body.price = Number.isFinite(p) ? Math.round(p * 100) / 100 : 0;
      console.debug("Normalized price for update:", req.body.price);
    }
    if (req.body.quantity !== undefined) {
      req.body.quantity = Number(req.body.quantity) || 0;
      console.debug("Normalized quantity for update:", req.body.quantity);
    }

    Object.assign(item, req.body);
    item.updatedAt = new Date();
    await item.save();

    try {
      await recalcOrdersForItem(item._id);
    } catch (e) {
      console.debug("recalcOrdersForItem post-update failed", e.message);
    }

    res.json(item);
  } catch (err) {
    console.error("Item update error:", err.message, err.errors);
    res.status(400).json({ message: "Bad request", error: err.message });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });

    // ✅ Only delete local files if item.images are filenames (strings)
    if (Array.isArray(item.images) && item.images.length > 0) {
      const localFiles = item.images.filter((img) => typeof img === "string");
      if (localFiles.length) deleteImages(localFiles);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Bad request" });
  }
};

// GET /api/items/:itemId/reviews/summary
exports.getReviewSummary = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const item = await Item.findById(itemId).select('_id');
    if (!item) return res.status(404).json({ message: 'Not found' });

    const comments = await Comment.find({ itemId, type: 'product' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (!comments.length) {
      return res.json({ message: 'No reviews yet' });
    }

    const ratings = comments
      .map((comment) => (Number.isFinite(comment.rating) ? comment.rating : null))
      .filter((rating) => rating !== null);
    const averageRating = ratings.length
      ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2))
      : null;

    const result = await summarizeReviews(comments);
    res.json({ ...result, averageRating });
  } catch (err) {
    console.error('Failed to summarize reviews', err.message);
    res.status(503).json({ message: 'Summary unavailable' });
  }
};
