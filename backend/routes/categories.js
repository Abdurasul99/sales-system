const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categories.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', ctrl.listCategories);
router.get('/:id', ctrl.getCategory);
router.post('/', verifyToken, ctrl.createCategory);
router.put('/:id', verifyToken, ctrl.updateCategory);
router.delete('/:id', verifyToken, ctrl.deleteCategory);

module.exports = router;
