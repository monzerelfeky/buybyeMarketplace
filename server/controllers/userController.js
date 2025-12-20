const User = require('../models/User');
const Item = require('../models/Item');

function parseIndex(param) {
  const idx = Number(param);
  if (!Number.isInteger(idx) || idx < 0) return null;
  return idx;
}

function ensureSingleDefault(list, defaultIndex) {
  for (let i = 0; i < list.length; i++) {
    list[i].isDefault = i === defaultIndex;
  }
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone isSeller');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSellerStatus = async (req, res) => {
  try {
    const { isSeller } = req.body;
    if (typeof isSeller !== 'boolean') {
      return res.status(400).json({ message: 'isSeller must be boolean' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isSeller, updatedAt: new Date() },
      { new: true }
    ).select('name email phone isSeller');

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    updates.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('name email phone');

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Addresses
exports.listAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user.addresses || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { label, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (!addressLine1 || !city || !postalCode) {
      return res.status(400).json({ message: 'Missing required fields: addressLine1, city, postalCode' });
    }

    const user = await User.findById(req.user.id).select('addresses updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const next = user.addresses ? [...user.addresses] : [];

    const newAddress = {
      label: label || 'Home',
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state: state || '',
      postalCode,
      country: country || '',
      isDefault: Boolean(isDefault),
    };

    next.push(newAddress);

    if (next.length === 1) {
      ensureSingleDefault(next, 0);
    } else if (newAddress.isDefault) {
      ensureSingleDefault(next, next.length - 1);
    } else {
      const hasDefault = next.some((a) => a.isDefault);
      if (!hasDefault) ensureSingleDefault(next, 0);
    }

    user.addresses = next;
    user.updatedAt = new Date();
    await user.save();

    return res.status(201).json(user.addresses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const idx = parseIndex(req.params.index);
    if (idx === null) return res.status(400).json({ message: 'Invalid index' });

    const { label, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    const user = await User.findById(req.user.id).select('addresses updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const next = user.addresses ? [...user.addresses] : [];
    if (idx >= next.length) return res.status(404).json({ message: 'Address not found' });

    if (label !== undefined) next[idx].label = label;
    if (addressLine1 !== undefined) next[idx].addressLine1 = addressLine1;
    if (addressLine2 !== undefined) next[idx].addressLine2 = addressLine2;
    if (city !== undefined) next[idx].city = city;
    if (state !== undefined) next[idx].state = state;
    if (postalCode !== undefined) next[idx].postalCode = postalCode;
    if (country !== undefined) next[idx].country = country;

    if (!next[idx].addressLine1 || !next[idx].city || !next[idx].postalCode) {
      return res.status(400).json({ message: 'addressLine1, city, postalCode are required' });
    }

    if (isDefault === true || isDefault === 'true') {
      ensureSingleDefault(next, idx);
    } else {
      const hasDefault = next.some((a) => a.isDefault);
      if (!hasDefault && next.length > 0) ensureSingleDefault(next, 0);
    }

    user.addresses = next;
    user.updatedAt = new Date();
    await user.save();

    return res.json(user.addresses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const idx = parseIndex(req.params.index);
    if (idx === null) return res.status(400).json({ message: 'Invalid index' });

    const user = await User.findById(req.user.id).select('addresses updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const next = user.addresses ? [...user.addresses] : [];
    if (idx >= next.length) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = Boolean(next[idx].isDefault);
    next.splice(idx, 1);

    if (next.length > 0) {
      const hasDefault = next.some((a) => a.isDefault);
      if (wasDefault || !hasDefault) ensureSingleDefault(next, 0);
    }

    user.addresses = next;
    user.updatedAt = new Date();
    await user.save();

    return res.json(user.addresses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const idx = parseIndex(req.params.index);
    if (idx === null) return res.status(400).json({ message: 'Invalid index' });

    const user = await User.findById(req.user.id).select('addresses updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const next = user.addresses ? [...user.addresses] : [];
    if (idx >= next.length) return res.status(404).json({ message: 'Address not found' });

    ensureSingleDefault(next, idx);

    user.addresses = next;
    user.updatedAt = new Date();
    await user.save();

    return res.json(user.addresses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Payment methods
exports.listPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('paymentMethods');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user.paymentMethods || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.addPaymentMethod = async (req, res) => {
  try {
    const { provider, token, brand, last4, expMonth, expYear, isDefault } = req.body;

    if (!provider || !token || !brand || !last4 || !expMonth || !expYear) {
      return res.status(400).json({
        message: 'Missing required fields: provider, token, brand, last4, expMonth, expYear',
      });
    }
    if (!/^\d{4}$/.test(String(last4))) {
      return res.status(400).json({ message: 'last4 must be 4 digits' });
    }

    const user = await User.findById(req.user.id).select('paymentMethods updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const next = user.paymentMethods ? [...user.paymentMethods] : [];

    const newPM = {
      provider,
      token,
      brand,
      last4: String(last4),
      expMonth: Number(expMonth),
      expYear: Number(expYear),
      isDefault: Boolean(isDefault),
    };

    next.push(newPM);

    if (next.length === 1) {
      ensureSingleDefault(next, 0);
    } else if (newPM.isDefault) {
      ensureSingleDefault(next, next.length - 1);
    } else {
      const hasDefault = next.some((m) => m.isDefault);
      if (!hasDefault) ensureSingleDefault(next, 0);
    }

    user.paymentMethods = next;
    user.updatedAt = new Date();
    await user.save();

    return res.status(201).json(user.paymentMethods);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const idx = parseIndex(req.params.index);
    if (idx === null) return res.status(400).json({ message: 'Invalid index' });

    const { brand, expMonth, expYear, isDefault } = req.body;

    const user = await User.findById(req.user.id).select('paymentMethods updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const next = user.paymentMethods ? [...user.paymentMethods] : [];
    if (idx >= next.length) return res.status(404).json({ message: 'Payment method not found' });

    if (brand !== undefined) next[idx].brand = brand;
    if (expMonth !== undefined) next[idx].expMonth = Number(expMonth);
    if (expYear !== undefined) next[idx].expYear = Number(expYear);

    if (isDefault === true || isDefault === 'true') {
      ensureSingleDefault(next, idx);
    } else {
      const hasDefault = next.some((m) => m.isDefault);
      if (!hasDefault && next.length > 0) ensureSingleDefault(next, 0);
    }

    user.paymentMethods = next;
    user.updatedAt = new Date();
    await user.save();

    return res.json(user.paymentMethods);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    const idx = parseIndex(req.params.index);
    if (idx === null) return res.status(400).json({ message: 'Invalid index' });

    const user = await User.findById(req.user.id).select('paymentMethods updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const next = user.paymentMethods ? [...user.paymentMethods] : [];
    if (idx >= next.length) return res.status(404).json({ message: 'Payment method not found' });

    const wasDefault = Boolean(next[idx].isDefault);
    next.splice(idx, 1);

    if (next.length > 0) {
      const hasDefault = next.some((m) => m.isDefault);
      if (wasDefault || !hasDefault) ensureSingleDefault(next, 0);
    }

    user.paymentMethods = next;
    user.updatedAt = new Date();
    await user.save();

    return res.json(user.paymentMethods);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const idx = parseIndex(req.params.index);
    if (idx === null) return res.status(400).json({ message: 'Invalid index' });

    const user = await User.findById(req.user.id).select('paymentMethods updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const next = user.paymentMethods ? [...user.paymentMethods] : [];
    if (idx >= next.length) return res.status(404).json({ message: 'Payment method not found' });

    ensureSingleDefault(next, idx);

    user.paymentMethods = next;
    user.updatedAt = new Date();
    await user.save();

    return res.json(user.paymentMethods);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name'); // just return name/email
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cart').populate('cart.itemId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user.cart || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    if (!itemId) return res.status(400).json({ message: 'itemId is required' });
    const qty = Number(quantity) || 1;
    if (qty < 1) return res.status(400).json({ message: 'quantity must be >= 1' });

    const item = await Item.findById(itemId).select('quantity');
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const user = await User.findById(req.user.id).select('cart updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = user.cart.find((entry) => String(entry.itemId) === String(itemId));
    if (existing) {
      const nextQty = (Number(existing.quantity) || 0) + qty;
      if (nextQty > item.quantity) {
        return res.status(400).json({ message: 'Quantity exceeds available stock' });
      }
      existing.quantity = nextQty;
    } else {
      if (qty > item.quantity) {
        return res.status(400).json({ message: 'Quantity exceeds available stock' });
      }
      user.cart.push({ itemId, quantity: qty, addedAt: new Date() });
    }

    user.updatedAt = new Date();
    await user.save();
    await user.populate('cart.itemId');
    return res.status(201).json(user.cart || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId) return res.status(400).json({ message: 'itemId is required' });
    const qty = Number(quantity);
    if (!Number.isFinite(qty)) return res.status(400).json({ message: 'quantity must be a number' });

    const item = await Item.findById(itemId).select('quantity');
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const user = await User.findById(req.user.id).select('cart updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idx = user.cart.findIndex((entry) => String(entry.itemId) === String(itemId));
    if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });

    if (qty <= 0) {
      user.cart.splice(idx, 1);
    } else {
      if (qty > item.quantity) {
        return res.status(400).json({ message: 'Quantity exceeds available stock' });
      }
      user.cart[idx].quantity = qty;
    }

    user.updatedAt = new Date();
    await user.save();
    await user.populate('cart.itemId');
    return res.json(user.cart || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!itemId) return res.status(400).json({ message: 'itemId is required' });

    const user = await User.findById(req.user.id).select('cart updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.cart = (user.cart || []).filter((entry) => String(entry.itemId) !== String(itemId));
    user.updatedAt = new Date();
    await user.save();
    await user.populate('cart.itemId');
    return res.json(user.cart || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cart updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.cart = [];
    user.updatedAt = new Date();
    await user.save();
    return res.json([]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
