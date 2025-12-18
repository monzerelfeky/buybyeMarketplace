const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get service areas for a seller
router.get('/:sellerId/service-areas', async (req, res) => {
  try {
    const user = await User.findById(req.params.sellerId).select('serviceAreas');
    if (!user) return res.status(404).json({ message: 'Seller not found' });
    res.json(user.serviceAreas || []);
  } catch (err) {
    console.error('Service areas fetch error:', err.message);
    res.status(400).json({ message: 'Bad request' });
  }
});

// Replace service areas for a seller
router.put('/:sellerId/service-areas', async (req, res) => {
  try {
    const areas = Array.isArray(req.body.serviceAreas) ? req.body.serviceAreas : [];
    const cleaned = areas.map((a) => ({
      city: a.city || '',
      areaName: a.areaName || '',
      radiusKm: Number(a.radiusKm) || 0,
      deliveryFee: Number(a.deliveryFee) || 0,
    }));

    const user = await User.findByIdAndUpdate(
      req.params.sellerId,
      { serviceAreas: cleaned, updatedAt: new Date() },
      { new: true, runValidators: true, setDefaultsOnInsert: true }
    ).select('serviceAreas');

    if (!user) return res.status(404).json({ message: 'Seller not found' });
    res.json(user.serviceAreas || []);
  } catch (err) {
    console.error('Service areas update error:', err.message);
    res.status(400).json({ message: 'Bad request' });
  }
});

module.exports = router;
