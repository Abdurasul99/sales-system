const Utils = require('../service/utils');
const Category = require('../models/categories.model');
const Product = require('../models/products.model');

exports.listCategories = async function (_req, res) {
    try {
        const categories = await Category.list();
        if (categories.length > 0) {
            return res.status(200).json(Utils.envelope({
                body: {
                    items: categories.map((c) => c.toClient()),
                    total: categories.length,
                },
            }));
        }

        // Fallback: derive categories from existing product.category strings
        // when the Category collection is empty (post-migration safety).
        const distinct = await Product.Product.distinct('category');
        const items = distinct
            .filter((v) => typeof v === 'string' && v.length > 0)
            .map((v) => ({ id: v, name: v, slug: v, isActive: true }));
        return res.status(200).json(Utils.envelope({
            body: { items, total: items.length },
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

exports.getCategory = async function (req, res) {
    try {
        const found = await Category.findById(req.params.id);
        if (!found) {
            return res.status(404).json(Utils.envelope({
                code: '8002',
                message: 'Category not found',
            }));
        }
        return res.status(200).json(Utils.envelope({ body: found.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.createCategory = async function (req, res) {
    try {
        const { name } = req.body;
        if (Utils.isEmpty(name)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Name is required',
            }));
        }
        const created = await Category.create(req.body, res.locals.id);
        if (!created) {
            return res.status(400).json(Utils.envelope({
                code: '8011',
                message: 'Category already exists or creation failed',
            }));
        }
        return res.status(200).json(Utils.envelope({ body: created.toClient() }));
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json(Utils.envelope({
                code: '8011',
                message: 'Category with this name or slug already exists',
            }));
        }
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.updateCategory = async function (req, res) {
    try {
        const updated = await Category.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json(Utils.envelope({
                code: '8002',
                message: 'Category not found',
            }));
        }
        return res.status(200).json(Utils.envelope({ body: updated.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.deleteCategory = async function (req, res) {
    try {
        const ok = await Category.remove(req.params.id);
        if (!ok) {
            return res.status(404).json(Utils.envelope({
                code: '8002',
                message: 'Category not found',
            }));
        }
        return res.status(200).json(Utils.envelope({ body: { id: req.params.id } }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};
