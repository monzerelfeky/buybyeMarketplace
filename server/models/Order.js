const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, min: 1, required: true }
}, { _id: false });

const StatusEnum = ['New','Accepted','Packed','Shipped','Delivered','Cancelled'];

const OrderSchema = new Schema({
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  items: { type: [OrderItemSchema], required: true },

  // totalPrice will be AUTOCALCULATED before save
  totalPrice: { type: Number, min: 0, required: true },

  orderNo: Schema.Types.Mixed,
  trackingNo: Schema.Types.Mixed,

  status: { type: String, enum: StatusEnum, default: 'New' },

  deliveryAddress: {
    city: String,
    addressLine1: String,
    addressLine2: String,
    postalCode: String
  },

  buyerNotes: String,
  deliveryNotes: String,

  placedAt: Date,

  payment: {
    paymentMethod: String,
    paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
    amount: Number,
    currency: String,
    transactionId: String,
    provider: String,
    paidAt: Date
  },

  statusHistory: [{
    status: { type: String, enum: StatusEnum },
    changedAt: Date,
    note: String
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Order', OrderSchema);
