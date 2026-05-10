const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sales.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', verifyToken, ctrl.listSales);
router.get('/summary', verifyToken, ctrl.summary);
router.get('/:id', verifyToken, ctrl.getSale);
router.post('/', verifyToken, ctrl.createSale);
router.post('/:id/void', verifyToken, ctrl.voidSale);

module.exports = router;
