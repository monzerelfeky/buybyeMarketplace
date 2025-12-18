const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id', updateOrder);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
