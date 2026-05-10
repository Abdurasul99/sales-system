/**
 * models/finance.model.js
 * Single ledger collection for both expenses and income, keyed by `kind`.
 */
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        kind: { type: String, enum: ['expense', 'income'], required: true, index: true },
        date: { type: Date, default: Date.now, index: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'UZS' },
        category: { type: String, default: 'general', trim: true, lowercase: true },
        description: { type: String, default: '' },
        paymentMethod: { type: String, enum: ['cash', 'card', 'transfer', 'other'], default: 'cash' },
        status: { type: String, enum: ['confirmed', 'pending'], default: 'confirmed' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

transactionSchema.methods.toClient = function () {
    return {
        id: this._id.toString(),
        kind: this.kind,
        date: this.date.toISOString(),
        amount: this.amount,
        currency: this.currency,
        category: this.category,
        description: this.description,
        paymentMethod: this.paymentMethod,
        status: this.status,
    };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

exports.list = async ({ kind, from, to } = {}) => {
    const filter = {};
    if (kind) filter.kind = kind;
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
    }
    return Transaction.find(filter).sort({ date: -1 }).limit(200);
};

exports.findById = async (id) => {
    try { return await Transaction.findById(id); } catch { return null; }
};

exports.create = async (data, createdBy) => {
    return Transaction.create({ ...data, createdBy });
};

exports.update = async (id, data) => {
    return Transaction.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.remove = async (id) => {
    const r = await Transaction.findByIdAndDelete(id);
    return r !== null;
};

exports.summary = async ({ kind, from, to } = {}) => {
    const match = {};
    if (kind) match.kind = kind;
    if (from || to) {
        match.date = {};
        if (from) match.date.$gte = new Date(from);
        if (to) match.date.$lte = new Date(to);
    }
    const r = await Transaction.aggregate([
        { $match: match },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
    ]);
    const total = r.reduce((s, x) => s + x.total, 0);
    return { total, byCategory: r.map((x) => ({ category: x._id, total: x.total, count: x.count })) };
};

exports.Transaction = Transaction;
