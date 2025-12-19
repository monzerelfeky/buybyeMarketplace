const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:itemId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: itemId } },
      { new: true }
    );

    res.json({ message: "Item added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/:itemId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: itemId } }
    );

    res.json({ message: "Item removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
