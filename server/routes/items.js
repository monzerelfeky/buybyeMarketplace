const express = require('express');
const {
  listItems,
  getSuggestions,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

const router = express.Router();

// Optional filter by sellerId to return only that seller's items
router.get('/suggestions', getSuggestions);
router.get('/', listItems);
router.post('/', createItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
