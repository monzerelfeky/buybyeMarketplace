const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const router = express.Router();

router.get("/", getWishlist);
router.post("/:itemId", addToWishlist);
router.delete("/:itemId", removeFromWishlist);

module.exports = router;
