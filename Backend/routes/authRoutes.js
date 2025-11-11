const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser, forgotPassword, resetPassword } = require('../controller/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
