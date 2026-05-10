/**
 * controllers/search.controllers.js — глобальный поиск по
 * товарам, продажам, клиентам и поставщикам.
 */
const Utils = require('../service/utils');
const Product = require('../models/products.model');
const Sale = require('../models/sales.model');
const Customer = require('../models/customers.model');
const Supplier = require('../models/suppliers.model');

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.global = async function (req, res) {
    try {
        const q = (req.query.q || '').toString().trim();
        const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 5));

        if (q.length === 0) {
            return res.status(200).json(Utils.envelope({
                body: {
                    query: '',
                    products: [],
                    sales: [],
                    customers: [],
                    suppliers: [],
                    total: 0,
                },
            }));
        }

        const rx = new RegExp(escapeRegex(q), 'i');

        const [products, sales, customers, suppliers] = await Promise.all([
            Product.Product
                .find({
                    isActive: true,
                    $or: [
                        { name: rx },
                        { sku: rx },
                        { description: rx },
                    ],
                })
                .sort({ updatedAt: -1 })
                .limit(limit)
                .lean(),

            Sale.Sale
                .find({
                    $or: [
                        { number: rx },
                        { 'customer.name': rx },
                        { 'customer.phone': rx },
                        { 'items.name': rx },
                        { 'items.sku': rx },
                    ],
                })
                .sort({ date: -1 })
                .limit(limit)
                .lean(),

            Customer.Customer
                .find({
                    $or: [
                        { name: rx },
                        { phone: rx },
                        { company: rx },
                        { address: rx },
                    ],
                })
                .sort({ updatedAt: -1 })
                .limit(limit)
                .lean(),

            Supplier.Supplier
                .find({
                    $or: [
                        { name: rx },
                        { phone: rx },
                        { contactPerson: rx },
                        { email: rx },
                        { category: rx },
                    ],
                })
                .sort({ updatedAt: -1 })
                .limit(limit)
                .lean(),
        ]);

        const total = products.length + sales.length + customers.length + suppliers.length;

        return res.status(200).json(Utils.envelope({
            body: {
                query: q,
                total,
                products: products.map((p) => ({
                    id: p._id.toString(),
                    name: p.name,
                    sku: p.sku,
                    price: p.price || 0,
                    cost: p.cost || 0,
                    currency: p.currency || 'UZS',
                    stock: p.stock || 0,
                    category: p.category || '',
                })),
                sales: sales.map((s) => ({
                    id: s._id.toString(),
                    number: s.number,
                    date: (s.date || s.createdAt || new Date()).toISOString(),
                    total: s.total || 0,
                    totalProfit: s.totalProfit || 0,
                    status: s.status || 'completed',
                    paymentMethod: s.paymentMethod || 'cash',
                    itemsCount: (s.items || []).length,
                    customer: {
                        name: s.customer?.name || '',
                        phone: s.customer?.phone || '',
                    },
                })),
                customers: customers.map((c) => ({
                    id: c._id.toString(),
                    name: c.name,
                    phone: c.phone || '',
                    company: c.company || '',
                    address: c.address || '',
                })),
                suppliers: suppliers.map((s) => ({
                    id: s._id.toString(),
                    name: s.name,
                    phone: s.phone || '',
                    contactPerson: s.contactPerson || '',
                    category: s.category || '',
                })),
            },
        }));
    } catch (err) {
        console.error('search.global error', err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};
