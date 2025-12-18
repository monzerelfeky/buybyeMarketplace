const express = require('express');
const {
  listItems,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

const router = express.Router();

// Optional filter by sellerId to return only that seller's items
router.get('/', listItems);
router.post('/', createItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
