const mongoose = require("mongoose");
const User = require("../models/User");

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/wishlist/:itemId
exports.addToWishlist = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { wishlist: itemId } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Item added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/wishlist/:itemId
exports.removeFromWishlist = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { itemId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { wishlist: itemId } }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Item removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
