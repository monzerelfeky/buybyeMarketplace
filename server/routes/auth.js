const express = require('express');
const { register, login, forgotPassword, resetPassword, validateResetToken } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);

module.exports = router;
