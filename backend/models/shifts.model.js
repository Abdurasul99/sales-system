/**
 * models/shifts.model.js
 */
const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
    {
        cashier: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            username: String,
        },
        openedAt: { type: Date, default: Date.now },
        closedAt: { type: Date },
        openingCash: { type: Number, default: 0, min: 0 },
        closingCash: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
        salesCount: { type: Number, default: 0 },
        salesRevenue: { type: Number, default: 0 },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

shiftSchema.methods.toClient = function () {
    return {
        id: this._id.toString(),
        cashier: this.cashier,
        openedAt: this.openedAt.toISOString(),
        closedAt: this.closedAt ? this.closedAt.toISOString() : null,
        openingCash: this.openingCash,
        closingCash: this.closingCash,
        status: this.status,
        salesCount: this.salesCount,
        salesRevenue: this.salesRevenue,
        notes: this.notes,
    };
};

const Shift = mongoose.model('Shift', shiftSchema);

exports.list = async () =>
    Shift.find().sort({ openedAt: -1 }).limit(50);

exports.findOpenForUser = async (userId) =>
    Shift.findOne({ 'cashier.id': userId, status: 'open' });

exports.open = async (cashier, openingCash) =>
    Shift.create({ cashier, openingCash, status: 'open' });

exports.close = async (id, closingCash, notes) => {
    return Shift.findByIdAndUpdate(
        id,
        { closingCash, notes, closedAt: new Date(), status: 'closed' },
        { new: true }
    );
};

exports.bumpSale = async (userId, total) => {
    const open = await Shift.findOne({ 'cashier.id': userId, status: 'open' });
    if (!open) return null;
    open.salesCount += 1;
    open.salesRevenue += Number(total) || 0;
    return open.save();
};

exports.Shift = Shift;
