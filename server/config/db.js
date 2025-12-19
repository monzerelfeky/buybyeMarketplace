const mongoose = require("mongoose");

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    "mongodb+srv://marketPlace:test1@cluster0.ybw5lfe.mongodb.net/marketplaceDB?retryWrites=true&w=majority";

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
