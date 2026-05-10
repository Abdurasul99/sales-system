const Utils = require('../service/utils');
const Purchase = require('../models/purchases.model');
const Product = require('../models/products.model');
const Supplier = require('../models/suppliers.model');

exports.list = async (req, res) => {
    try {
        const items = await Purchase.list(req.query);
        return res.status(200).json(Utils.envelope({
            body: { items: items.map((p) => p.toClient()), total: items.length },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.summary = async (req, res) => {
    try {
        const data = await Purchase.summary(req.query);
        return res.status(200).json(Utils.envelope({ body: data }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.create = async (req, res) => {
    try {
        const { items = [], supplierId, paymentMethod = 'transfer', notes = '', currency = 'UZS' } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json(Utils.envelope({ code: '8001', message: 'Purchase must have at least one item' }));
        }

        let supplierBlock;
        if (supplierId) {
            const s = await Supplier.findById(supplierId);
            if (s) supplierBlock = { id: s._id, name: s.name, phone: s.phone };
        }

        const enriched = [];
        let subtotal = 0;
        for (const raw of items) {
            const product = await Product.findProductById(raw.productId);
            if (!product) {
                return res.status(400).json(Utils.envelope({ code: '8002', message: `Product ${raw.productId} not found` }));
            }
            const qty = Number(raw.quantity);
            const cost = Number(raw.cost ?? raw.price ?? product.price);
            if (qty <= 0) {
                return res.status(400).json(Utils.envelope({ code: '8001', message: `Invalid quantity for ${product.name}` }));
            }
            const total = cost * qty;
            enriched.push({ productId: product._id, name: product.name, sku: product.sku, cost, quantity: qty, total, _ref: product });
            subtotal += total;
        }

        for (const it of enriched) {
            it._ref.stock += it.quantity;
            await it._ref.save();
        }

        const purchase = await Purchase.create({
            supplier: supplierBlock,
            items: enriched.map(({ _ref, ...rest }) => rest),
            subtotal,
            total: subtotal,
            currency,
            paymentMethod,
            notes,
            createdBy: res.locals.id,
        });

        if (supplierBlock?.id) {
            await Supplier.bumpAfterPurchase(supplierBlock.id, subtotal);
        }

        return res.status(200).json(Utils.envelope({ body: purchase.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};
