const express = require('express');
const {
  listItems,
  getItem,
  getReviewSummary,
  getSuggestions,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

const router = express.Router();

// Optional filter by sellerId to return only that seller's items
router.get('/suggestions', getSuggestions);
router.get('/:itemId/reviews/summary', getReviewSummary);
router.get('/', listItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
