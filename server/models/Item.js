const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new Schema({
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, min: 0, required: true },
  category: String,
  deliveryEstimate: String,
  images: [String],
  quantity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Item', ItemSchema);
