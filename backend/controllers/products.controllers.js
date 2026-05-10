const Utils = require('../service/utils');
const Product = require('../models/products.model');

exports.getProducts = async function (req, res) {
    try {
        const { q, category } = req.query;
        const products = await Product.listProducts({ q, category });

        return res.status(200).json(Utils.envelope({
            body: {
                items: products.map((p) => p.toClient()),
                total: products.length,
            },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.getProduct = async function (req, res) {
    try {
        const { id } = req.params;
        if (Utils.isEmpty(id)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Missing product id',
            }));
        }

        const product = await Product.findProductById(id);
        if (!product) {
            return res.status(404).json(Utils.envelope({
                code: '8002',
                message: 'Product not found',
            }));
        }

        return res.status(200).json(Utils.envelope({
            body: product.toClient(),
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.createProduct = async function (req, res) {
    try {
        const { name, sku, price } = req.body;
        if (Utils.isEmpty(name) || Utils.isEmpty(sku) || Utils.isNull(price)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Missing name, sku or price',
            }));
        }

        const created = await Product.createProduct(req.body, res.locals.id);
        if (!created) {
            return res.status(500).json(Utils.envelope({
                code: '8012',
                message: 'Failed to create product',
            }));
        }

        return res.status(200).json(Utils.envelope({
            body: created.toClient(),
        }));
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json(Utils.envelope({
                code: '8011',
                message: 'SKU already exists',
            }));
        }
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.updateProduct = async function (req, res) {
    try {
        const { id } = req.params;
        if (Utils.isEmpty(id)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Missing product id',
            }));
        }

        const updated = await Product.updateProduct(id, req.body);
        if (!updated) {
            return res.status(404).json(Utils.envelope({
                code: '8002',
                message: 'Product not found',
            }));
        }

        return res.status(200).json(Utils.envelope({
            body: updated.toClient(),
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.deleteProduct = async function (req, res) {
    try {
        const { id } = req.params;
        if (Utils.isEmpty(id)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Missing product id',
            }));
        }

        const ok = await Product.deleteProduct(id);
        if (!ok) {
            return res.status(404).json(Utils.envelope({
                code: '8002',
                message: 'Product not found',
            }));
        }

        return res.status(200).json(Utils.envelope({
            body: { id },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};
