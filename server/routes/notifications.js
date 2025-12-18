const express = require('express');
const { protect } = require('../utils/authMiddleware');
const {
  createNotification,
  listNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.post('/', protect, createNotification);
router.get('/', protect, listNotifications);
router.patch('/:id/read', protect, markOneRead);
router.patch('/read-all', protect, markAllRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
