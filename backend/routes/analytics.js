const router = require('express').Router();
const ctrl = require('../controllers/analytics.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/overview', verifyToken, ctrl.overview);
router.get('/abc', verifyToken, ctrl.abc);
router.get('/notifications', verifyToken, ctrl.notifications);

module.exports = router;
