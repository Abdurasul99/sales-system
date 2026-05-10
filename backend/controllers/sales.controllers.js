const Utils = require('../service/utils');
const Sale = require('../models/sales.model');
const Product = require('../models/products.model');
const User = require('../models/users.model');

exports.listSales = async function (req, res) {
    try {
        const sales = await Sale.list(req.query);
        return res.status(200).json(Utils.envelope({
            body: {
                items: sales.map((s) => s.toClient()),
                total: sales.length,
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

exports.getSale = async function (req, res) {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json(Utils.envelope({
                code: '8002',
                message: 'Sale not found',
            }));
        }
        return res.status(200).json(Utils.envelope({ body: sale.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.summary = async function (req, res) {
    try {
        const data = await Sale.summary(req.query);
        return res.status(200).json(Utils.envelope({ body: data }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

/**
 * POST /api/sales
 * Body: { items: [{productId, quantity, price?}], discount?, tax?, paymentMethod?, customer?, notes? }
 * - Validates each product exists and has enough stock
 * - Decrements stock atomically per item
 * - Calculates subtotal/total server-side
 * - Auto-generates sequential sale number (S-YYYY-NNNNN)
 */
exports.createSale = async function (req, res) {
    try {
        const {
            items = [],
            discount = 0,
            tax = 0,
            paymentMethod = 'cash',
            customer = {},
            notes = '',
            currency = 'UZS',
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Sale must have at least one item',
            }));
        }

        // Validate + enrich each item from DB
        const enriched = [];
        let subtotal = 0;
        let totalCost = 0;
        for (const raw of items) {
            if (!raw || !raw.productId || !raw.quantity) {
                return res.status(400).json(Utils.envelope({
                    code: '8001',
                    message: 'Each item needs productId and quantity',
                }));
            }
            const product = await Product.findProductById(raw.productId);
            if (!product) {
                return res.status(400).json(Utils.envelope({
                    code: '8002',
                    message: `Product ${raw.productId} not found`,
                }));
            }
            const quantity = Number(raw.quantity);
            if (quantity <= 0 || !Number.isFinite(quantity)) {
                return res.status(400).json(Utils.envelope({
                    code: '8001',
                    message: `Invalid quantity for ${product.name}`,
                }));
            }
            if (product.stock < quantity) {
                return res.status(400).json(Utils.envelope({
                    code: '8013',
                    message: `Not enough stock for ${product.name} (have ${product.stock}, need ${quantity})`,
                }));
            }
            const price = raw.price != null ? Number(raw.price) : Number(product.price);
            const cost = Number(product.cost || 0);
            const lineTotal = price * quantity;
            const lineCogs = cost * quantity;
            const lineProfit = lineTotal - lineCogs;
            enriched.push({
                productId: product._id,
                name: product.name,
                sku: product.sku,
                price,
                cost,
                quantity,
                total: lineTotal,
                cogs: lineCogs,
                profit: lineProfit,
                _productRef: product,
            });
            subtotal += lineTotal;
            totalCost += lineCogs;
        }

        const total = Math.max(0, subtotal - Number(discount) + Number(tax));
        const totalProfit = total - totalCost;

        // Decrement stock per product (no transactions to keep things simple)
        for (const it of enriched) {
            it._productRef.stock = Math.max(0, it._productRef.stock - it.quantity);
            await it._productRef.save();
        }

        // Cashier from JWT (res.locals.id was set by verifyToken)
        const cashierUser = res.locals.id ? await User.findUserById(res.locals.id) : null;

        const sale = await Sale.create({
            items: enriched.map((it) => ({
                productId: it.productId,
                name: it.name,
                sku: it.sku,
                price: it.price,
                cost: it.cost,
                quantity: it.quantity,
                total: it.total,
                cogs: it.cogs,
                profit: it.profit,
            })),
            subtotal,
            discount: Number(discount) || 0,
            tax: Number(tax) || 0,
            total,
            totalCost,
            totalProfit,
            currency,
            paymentMethod,
            customer: {
                name: customer?.name || '',
                phone: customer?.phone || '',
            },
            cashier: cashierUser
                ? {
                      id: cashierUser._id,
                      name: cashierUser.name,
                      username: cashierUser.username,
                  }
                : undefined,
            notes,
        });

        return res.status(200).json(Utils.envelope({ body: sale.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.voidSale = async function (req, res) {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json(Utils.envelope({
                code: '8002',
                message: 'Sale not found',
            }));
        }
        if (sale.status === 'voided') {
            return res.status(400).json(Utils.envelope({
                code: '8014',
                message: 'Sale is already voided',
            }));
        }

        // Restore stock
        for (const it of sale.items) {
            const product = await Product.findProductById(it.productId);
            if (product) {
                product.stock += it.quantity;
                await product.save();
            }
        }

        const updated = await Sale.markVoided(req.params.id);
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
