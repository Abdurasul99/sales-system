const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.post('/register', authController.signUp);
router.post('/login', authController.signIn);
router.get('/me', verifyToken, authController.getMe);
router.post('/change-password', verifyToken, authController.changePassword);
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
