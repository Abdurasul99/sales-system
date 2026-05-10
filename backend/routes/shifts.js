const router = require('express').Router();
const ctrl = require('../controllers/shifts.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', verifyToken, ctrl.list);
router.get('/current', verifyToken, ctrl.current);
router.post('/open', verifyToken, ctrl.open);
router.post('/close', verifyToken, ctrl.close);

module.exports = router;
