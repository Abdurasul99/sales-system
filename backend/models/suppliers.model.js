/**
 * models/suppliers.model.js
 */
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        contactPerson: { type: String, default: '' },
        phone: { type: String, default: '', trim: true },
        email: { type: String, default: '', lowercase: true, trim: true },
        address: { type: String, default: '' },
        category: { type: String, default: '' },
        notes: { type: String, default: '' },
        // Aggregate fields kept fresh by purchases controller
        totalOrders: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        lastOrderAt: { type: Date },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

supplierSchema.index({ name: 'text', phone: 'text', contactPerson: 'text' });

supplierSchema.methods.toClient = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        contactPerson: this.contactPerson,
        phone: this.phone,
        email: this.email,
        address: this.address,
        category: this.category,
        notes: this.notes,
        totalOrders: this.totalOrders,
        totalSpent: this.totalSpent,
        lastOrderAt: this.lastOrderAt ? this.lastOrderAt.toISOString() : null,
        isActive: this.isActive,
    };
};

const Supplier = mongoose.model('Supplier', supplierSchema);

exports.list = async ({ q } = {}) => {
    const filter = {};
    if (q && q.length > 0) {
        filter.$or = [
            { name: new RegExp(q, 'i') },
            { phone: new RegExp(q, 'i') },
            { contactPerson: new RegExp(q, 'i') },
        ];
    }
    return Supplier.find(filter).sort({ createdAt: -1 });
};

exports.findById = async (id) => {
    try {
        return await Supplier.findById(id);
    } catch {
        return null;
    }
};

exports.create = async (data, createdBy) => {
    return Supplier.create({ ...data, createdBy });
};

exports.update = async (id, data) => {
    return Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.remove = async (id) => {
    const r = await Supplier.findByIdAndDelete(id);
    return r !== null;
};

exports.bumpAfterPurchase = async (id, amount) => {
    return Supplier.findByIdAndUpdate(id, {
        $inc: { totalOrders: 1, totalSpent: amount },
        $set: { lastOrderAt: new Date() },
    });
};

exports.Supplier = Supplier;
