const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { protect } = require("../utils/authMiddleware");

const router = express.Router();

/**
 * Helper: validate ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * CREATE notification
 * POST /api/notifications
 * Body: { type, data, userId? }
 *
 * By default we create for the logged-in user.
 * If you want to allow creating for another user (admin/system), keep userId.
 * Otherwise you can remove userId support entirely.
 */
router.post("/", protect, async (req, res) => {
  try {
    const { type, data, userId } = req.body;

    if (!type) return res.status(400).json({ message: "type is required" });

    // Default to the logged-in user
    const targetUserId = userId || req.user.id;

    if (!isValidObjectId(targetUserId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const n = await Notification.create({
      userId: targetUserId,
      type,
      data: data || {},
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json(n);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Bad request" });
  }
});

/**
 * LIST my notifications
 * GET /api/notifications?unreadOnly=true&limit=200
 */
router.get("/", protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "200", 10), 200);
    const unreadOnly = String(req.query.unreadOnly || "false") === "true";

    const filter = { userId: req.user.id };
    if (unreadOnly) filter.isRead = false;

    const notes = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json(notes);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Bad request" });
  }
});

/**
 * MARK ONE as read
 * PATCH /api/notifications/:id/read
 */
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // ensures user can only update their own
      { $set: { isRead: true, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Bad request" });
  }
});

/**
 * MARK ALL as read
 * PATCH /api/notifications/read-all
 */
router.patch("/read-all", protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true, updatedAt: new Date() } }
    );

    // result.modifiedCount for newer mongoose, result.nModified for older
    return res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Bad request" });
  }
});

/**
 * (Optional) DELETE one notification
 * DELETE /api/notifications/:id
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({ message: "Deleted", id });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Bad request" });
  }
});

module.exports = router;
