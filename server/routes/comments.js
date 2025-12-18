const express = require('express');
const { createComment, listComments } = require('../controllers/commentController');

const router = express.Router();

router.post('/', createComment);
router.get('/', listComments);

module.exports = router;
