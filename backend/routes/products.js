const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controllers');
const { verifyToken } = require('../middlewares/authorization');

router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProduct);
router.post('/', verifyToken, productsController.createProduct);
router.put('/:id', verifyToken, productsController.updateProduct);
router.delete('/:id', verifyToken, productsController.deleteProduct);

module.exports = router;
