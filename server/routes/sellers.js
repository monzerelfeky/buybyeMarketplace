const express = require('express');
const { getServiceAreas, updateServiceAreas } = require('../controllers/sellerController');

const router = express.Router();

router.get('/:sellerId/service-areas', getServiceAreas);
router.put('/:sellerId/service-areas', updateServiceAreas);

module.exports = router;
