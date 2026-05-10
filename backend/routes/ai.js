const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ai.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/suggestions', verifyToken, ctrl.suggestions);
router.post('/chat', verifyToken, ctrl.chat);

module.exports = router;
