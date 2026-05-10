const router = require('express').Router();
const ctrl = require('../controllers/purchases.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', verifyToken, ctrl.list);
router.get('/summary', verifyToken, ctrl.summary);
router.post('/', verifyToken, ctrl.create);

module.exports = router;
