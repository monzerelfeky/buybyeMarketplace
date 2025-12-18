const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['order', 'product'], default: 'order' },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

CommentSchema.index({ orderId: 1 });
CommentSchema.index({ itemId: 1 });
CommentSchema.index({ authorId: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
