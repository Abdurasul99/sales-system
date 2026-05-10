const router = require('express').Router();
const { income } = require('../controllers/finance.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', verifyToken, income.list);
router.get('/summary', verifyToken, income.summary);
router.post('/', verifyToken, income.create);
router.put('/:id', verifyToken, income.update);
router.delete('/:id', verifyToken, income.remove);

module.exports = router;
