/**
 * models/sales.model.js
 */
const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        sku: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        cost: { type: Number, default: 0, min: 0 },     // себестоимость на момент продажи
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true, min: 0 }, // выручка по строке = price * quantity
        cogs: { type: Number, default: 0, min: 0 },      // себестоимость по строке = cost * quantity
        profit: { type: Number, default: 0 },            // прибыль по строке = total - cogs
    },
    { _id: false }
);

const saleSchema = new mongoose.Schema(
    {
        number: { type: String, required: true, unique: true, index: true },
        date: { type: Date, default: Date.now },
        items: { type: [saleItemSchema], default: [] },
        subtotal: { type: Number, required: true, default: 0 },
        discount: { type: Number, default: 0, min: 0 },
        tax: { type: Number, default: 0, min: 0 },
        total: { type: Number, required: true, default: 0 },
        totalCost: { type: Number, default: 0, min: 0 }, // совокупная себестоимость по чеку
        totalProfit: { type: Number, default: 0 },        // совокупная прибыль по чеку
        currency: { type: String, default: 'UZS' },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'transfer', 'mixed'],
            default: 'cash',
        },
        status: { type: String, enum: ['completed', 'voided'], default: 'completed' },
        customer: {
            name: { type: String, default: '' },
            phone: { type: String, default: '' },
        },
        cashier: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            username: String,
        },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

saleSchema.methods.toClient = function () {
    const total = this.total || 0;
    const totalCost = this.totalCost || 0;
    const totalProfit = this.totalProfit != null
        ? this.totalProfit
        : Math.max(0, total - totalCost);
    const marginPct = total > 0 ? (totalProfit / total) * 100 : 0;
    return {
        id: this._id.toString(),
        number: this.number,
        date: this.date.toISOString(),
        items: this.items.map((it) => ({
            productId: it.productId.toString(),
            name: it.name,
            sku: it.sku,
            price: it.price,
            cost: it.cost || 0,
            quantity: it.quantity,
            total: it.total,
            cogs: it.cogs || 0,
            profit: it.profit != null ? it.profit : (it.total - (it.cogs || 0)),
        })),
        subtotal: this.subtotal,
        discount: this.discount,
        tax: this.tax,
        total,
        totalCost,
        totalProfit,
        marginPct,
        currency: this.currency,
        paymentMethod: this.paymentMethod,
        status: this.status,
        customer: this.customer,
        cashier: this.cashier,
        notes: this.notes,
        createdAt: this.createdAt.toISOString(),
    };
};

const Sale = mongoose.model('Sale', saleSchema);

async function nextSaleNumber() {
    const year = new Date().getFullYear();
    const prefix = `S-${year}-`;
    const last = await Sale.findOne({ number: { $regex: `^${prefix}` } })
        .sort({ number: -1 })
        .select('number')
        .lean();
    let seq = 1;
    if (last && last.number) {
        const m = last.number.match(/(\d+)$/);
        if (m) seq = Number(m[1]) + 1;
    }
    return `${prefix}${String(seq).padStart(5, '0')}`;
}

exports.list = async ({ from, to, status, q, limit = 100 } = {}) => {
    try {
        const filter = {};
        if (status) filter.status = status;
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }
        if (q) {
            filter.$or = [
                { number: new RegExp(q, 'i') },
                { 'customer.name': new RegExp(q, 'i') },
            ];
        }
        return await Sale.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    } catch (err) {
        console.error('Sale.list error', err);
        return [];
    }
};

exports.findById = async (id) => {
    try {
        return await Sale.findById(id);
    } catch (err) {
        console.error('Sale.findById error', err);
        return null;
    }
};

exports.create = async (data) => {
    try {
        const number = data.number || (await nextSaleNumber());
        return await Sale.create({ ...data, number });
    } catch (err) {
        console.error('Sale.create error', err);
        throw err;
    }
};

exports.markVoided = async (id) => {
    try {
        return await Sale.findByIdAndUpdate(id, { status: 'voided' }, { new: true });
    } catch (err) {
        console.error('Sale.markVoided error', err);
        return null;
    }
};

exports.summary = async ({ from, to } = {}) => {
    try {
        const match = { status: 'completed' };
        if (from || to) {
            match.date = {};
            if (from) match.date.$gte = new Date(from);
            if (to) match.date.$lte = new Date(to);
        }
        const result = await Sale.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    totalCost: { $sum: '$totalCost' },
                    totalProfit: { $sum: '$totalProfit' },
                    totalDiscount: { $sum: '$discount' },
                    averageCheck: { $avg: '$total' },
                },
            },
        ]);
        const r = result[0] || {};
        const totalRevenue = r.totalRevenue || 0;
        const totalProfit = r.totalProfit || 0;
        return {
            count: r.count || 0,
            totalRevenue,
            totalCost: r.totalCost || 0,
            totalProfit,
            marginPct: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
            totalDiscount: r.totalDiscount || 0,
            averageCheck: r.averageCheck || 0,
        };
    } catch (err) {
        console.error('Sale.summary error', err);
        return {
            count: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0,
            marginPct: 0, totalDiscount: 0, averageCheck: 0,
        };
    }
};

exports.Sale = Sale;
exports.nextSaleNumber = nextSaleNumber;
