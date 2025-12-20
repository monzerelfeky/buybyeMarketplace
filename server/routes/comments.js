const express = require('express');
const { createComment, listComments, listProductComments } = require('../controllers/commentController');

const router = express.Router();

router.post('/', createComment);
router.get('/', listComments);
router.get('/product/:productId', listProductComments)

module.exports = router;
