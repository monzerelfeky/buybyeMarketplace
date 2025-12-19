const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({
  label: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  postalCode: String,
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const PaymentMethodSchema = new Schema({
  provider: String,
  token: String,
  brand: String,
  last4: String,
  expMonth: Number,
  expYear: Number,
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const PayoutSchema = new Schema({
  type: String,
  provider: String,
  maskedAccount: String,
  payoutToken: String
}, { _id: false });

const SellerProfileSchema = new Schema({
  rating: { type: Number, min: 0, default: 0 },
  ratingCount: { type: Number, min: 0, default: 0 },
  sellerFlags: { type: Number, default: 0 }
}, { _id: false });

const FlagLockSchema = new Schema({
  locked: { type: Boolean, default: false },
  reason: String,
  since: Date,
  until: Date,
  strikes: { type: Number, default: 0 }, // number of times auto-lock was applied
  lastReviewedAt: Date
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isSeller: { type: Boolean, required: true },
  phone: String,
  addresses: [AddressSchema],
  cart: [{ itemId: { type: Schema.Types.ObjectId, ref: 'Item' }, quantity: { type: Number, min: 1 }, addedAt: Date }],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  paymentMethods: [PaymentMethodSchema],
  sellerProfile: SellerProfileSchema,
  serviceAreas: [{ city: String, areaName: String, radiusKm: Number, deliveryFee: Number }],
  payoutMethods: [PayoutSchema],
  flagsCount: { type: Number, default: 0 },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  flagLock: FlagLockSchema,
  resetToken: String,
  resetTokenExpires: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('User', UserSchema);
