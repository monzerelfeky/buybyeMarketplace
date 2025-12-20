const express = require("express");
const upload = require("../middlewares/upload");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryupload");

const router = express.Router();

// FormData key must be "images"
router.post("/listing-images", upload.array("images", 8), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = await Promise.all(
      req.files.map(async (file, idx) => {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "buybye/listings",
        });

        return {
          url: result.secure_url
        };
      })
    );

    return res.json({ images });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

module.exports = router;
