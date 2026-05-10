const router = require('express').Router();
const ctrl = require('../controllers/currency.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', verifyToken, ctrl.list);
router.put('/:code', verifyToken, ctrl.update);

module.exports = router;
