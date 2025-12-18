const mongoose = require('mongoose');
const { Schema } = mongoose;

const FlagSchema = new Schema({
  flaggedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  flaggedUserRole: { type: String, enum: ['buyer', 'seller'], required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

FlagSchema.index({ flaggedUserId: 1 });
FlagSchema.index({ createdByUserId: 1 });
FlagSchema.index({ orderId: 1 });
FlagSchema.index({ status: 1 });

module.exports = mongoose.model('Flag', FlagSchema);
