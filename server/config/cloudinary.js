const cloudinary = require("cloudinary").v2;

// This automatically reads CLOUDINARY_URL
cloudinary.config();

module.exports = cloudinary;
