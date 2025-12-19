const express = require('express');
const { protect } = require('../utils/authMiddleware');
const {
  getProfile,
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  listPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getUserById
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

router.get('/me/addresses', protect, listAddresses);
router.post('/me/addresses', protect, addAddress);
router.put('/me/addresses/:index', protect, updateAddress);
router.delete('/me/addresses/:index', protect, deleteAddress);
router.patch('/me/addresses/:index/default', protect, setDefaultAddress);

router.get('/me/payment-methods', protect, listPaymentMethods);
router.post('/me/payment-methods', protect, addPaymentMethod);
router.put('/me/payment-methods/:index', protect, updatePaymentMethod);
router.delete('/me/payment-methods/:index', protect, deletePaymentMethod);
router.patch('/me/payment-methods/:index/default', protect, setDefaultPaymentMethod);

router.get('/:id', getUserById);

module.exports = router;
