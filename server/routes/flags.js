const express = require('express');
const {
  createFlag,
  listFlags,
  updateFlagStatus,
} = require('../controllers/flagController');

const router = express.Router();

router.post('/', createFlag);
router.get('/', listFlags);
router.patch('/:id/status', updateFlagStatus);

module.exports = router;
