/**
 * models/purchases.model.js
 * Purchase = receiving stock from a supplier.
 */
const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        sku: { type: String, default: '' },
        cost: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const purchaseSchema = new mongoose.Schema(
    {
        number: { type: String, required: true, unique: true, index: true },
        date: { type: Date, default: Date.now },
        supplier: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
            name: String,
            phone: String,
        },
        items: { type: [purchaseItemSchema], default: [] },
        subtotal: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
        currency: { type: String, default: 'UZS' },
        paymentMethod: { type: String, enum: ['cash', 'card', 'transfer', 'credit'], default: 'transfer' },
        status: { type: String, enum: ['received', 'voided'], default: 'received' },
        notes: { type: String, default: '' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

purchaseSchema.methods.toClient = function () {
    return {
        id: this._id.toString(),
        number: this.number,
        date: this.date.toISOString(),
        supplier: this.supplier,
        items: this.items.map((it) => ({
            productId: it.productId.toString(),
            name: it.name,
            sku: it.sku,
            cost: it.cost,
            quantity: it.quantity,
            total: it.total,
        })),
        subtotal: this.subtotal,
        total: this.total,
        currency: this.currency,
        paymentMethod: this.paymentMethod,
        status: this.status,
        notes: this.notes,
        createdAt: this.createdAt.toISOString(),
    };
};

const Purchase = mongoose.model('Purchase', purchaseSchema);

async function nextPurchaseNumber() {
    const year = new Date().getFullYear();
    const prefix = `P-${year}-`;
    const last = await Purchase.findOne({ number: { $regex: `^${prefix}` } })
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

exports.list = async ({ from, to, supplierId } = {}) => {
    const filter = {};
    if (supplierId) filter['supplier.id'] = supplierId;
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
    }
    return Purchase.find(filter).sort({ createdAt: -1 }).limit(200);
};

exports.findById = async (id) => {
    try { return await Purchase.findById(id); } catch { return null; }
};

exports.create = async (data) => {
    const number = data.number || (await nextPurchaseNumber());
    return Purchase.create({ ...data, number });
};

exports.summary = async ({ from, to } = {}) => {
    const match = { status: 'received' };
    if (from || to) {
        match.date = {};
        if (from) match.date.$gte = new Date(from);
        if (to) match.date.$lte = new Date(to);
    }
    const r = await Purchase.aggregate([
        { $match: match },
        { $group: { _id: null, count: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    ]);
    return { count: r[0]?.count || 0, totalSpent: r[0]?.totalSpent || 0 };
};

exports.Purchase = Purchase;
