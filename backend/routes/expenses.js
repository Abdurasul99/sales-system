const router = require('express').Router();
const { expenses } = require('../controllers/finance.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', verifyToken, expenses.list);
router.get('/summary', verifyToken, expenses.summary);
router.post('/', verifyToken, expenses.create);
router.put('/:id', verifyToken, expenses.update);
router.delete('/:id', verifyToken, expenses.remove);

module.exports = router;
