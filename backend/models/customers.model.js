/**
 * models/customers.model.js
 */
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, default: '', trim: true },
        email: { type: String, default: '', lowercase: true, trim: true },
        company: { type: String, default: '' },
        address: { type: String, default: '' },
        notes: { type: String, default: '' },
        // Aggregate fields kept fresh by sales controller
        totalPurchases: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        lastPurchaseAt: { type: Date },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text', phone: 'text', company: 'text' });

customerSchema.methods.toClient = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        phone: this.phone,
        email: this.email,
        company: this.company,
        address: this.address,
        notes: this.notes,
        totalPurchases: this.totalPurchases,
        totalSpent: this.totalSpent,
        lastPurchaseAt: this.lastPurchaseAt ? this.lastPurchaseAt.toISOString() : null,
        isActive: this.isActive,
    };
};

const Customer = mongoose.model('Customer', customerSchema);

exports.list = async ({ q } = {}) => {
    const filter = {};
    if (q && q.length > 0) {
        filter.$or = [
            { name: new RegExp(q, 'i') },
            { phone: new RegExp(q, 'i') },
            { company: new RegExp(q, 'i') },
        ];
    }
    return Customer.find(filter).sort({ createdAt: -1 });
};

exports.findById = async (id) => {
    try {
        return await Customer.findById(id);
    } catch {
        return null;
    }
};

exports.findByPhone = async (phone) => {
    if (!phone) return null;
    return Customer.findOne({ phone });
};

exports.create = async (data, createdBy) => {
    return Customer.create({ ...data, createdBy });
};

exports.update = async (id, data) => {
    return Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.remove = async (id) => {
    const r = await Customer.findByIdAndDelete(id);
    return r !== null;
};

exports.bumpAfterSale = async (id, amount) => {
    return Customer.findByIdAndUpdate(id, {
        $inc: { totalPurchases: 1, totalSpent: amount },
        $set: { lastPurchaseAt: new Date() },
    });
};

exports.Customer = Customer;
