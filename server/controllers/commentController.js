const Comment = require('../models/Comment');
const Order = require('../models/Order');

exports.createComment = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.itemId && !payload.orderId && !payload.type) {
      payload.type = 'product';
    }

    if (payload.type === 'product' && payload.itemId) {
      if (!payload.authorId) {
        return res.status(400).json({ message: 'authorId is required' });
      }

      const deliveredOrder = await Order.findOne({
        buyerId: payload.authorId,
        status: 'Delivered',
        'items.itemId': payload.itemId,
      }).select('_id');

      if (!deliveredOrder) {
        return res.status(403).json({
          message: 'You can only review items from delivered orders.',
        });
      }
    }

    const c = new Comment(payload);
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};

exports.listComments = async (req, res) => {
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
};

// GET /api/comments/product/:productId
exports.listProductComments = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ message: "Missing productId" });

    const comments = await Comment.find({ itemId: productId, type: "product" })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Bad request" });
  }
};

