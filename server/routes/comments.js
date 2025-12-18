const express = require('express');
const Comment = require('../models/Comment');

const router = express.Router();

// Create comment
router.post('/', async (req, res) => {
  try {
    const c = new Comment(req.body);
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

// Get comments for order or item
router.get('/', async (req, res) => {
  try {
    const { orderId, itemId } = req.query;
    const q = {};
    if (orderId) q.orderId = orderId;
    if (itemId) q.itemId = itemId;
    const comments = await Comment.find(q).sort({ createdAt: -1 }).limit(200);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
});

module.exports = router;
