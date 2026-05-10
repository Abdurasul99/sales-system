/**
 * models/currency.model.js
 * Stores per-currency rates with UZS as the base.
 */
const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        name: { type: String, default: '' },
        rate: { type: Number, required: true, min: 0 }, // 1 unit of `code` = `rate` UZS
        source: { type: String, default: 'manual' },
    },
    { timestamps: true }
);

rateSchema.methods.toClient = function () {
    return {
        id: this._id.toString(),
        code: this.code,
        name: this.name,
        rate: this.rate,
        source: this.source,
        updatedAt: this.updatedAt.toISOString(),
    };
};

const Rate = mongoose.model('CurrencyRate', rateSchema);

const DEFAULTS = [
    { code: 'USD', name: 'Доллар США',           rate: 12500 },
    { code: 'EUR', name: 'Евро',                 rate: 13800 },
    { code: 'RUB', name: 'Российский рубль',     rate:   145 },
    { code: 'KZT', name: 'Казахстанский тенге',  rate:    27 },
    { code: 'CNY', name: 'Китайский юань',       rate:  1750 },
];

exports.list = async () => {
    let docs = await Rate.find().sort({ code: 1 });
    if (docs.length === 0) {
        await Rate.insertMany(DEFAULTS);
        docs = await Rate.find().sort({ code: 1 });
    }
    return docs;
};

exports.upsert = async (code, payload) => {
    return Rate.findOneAndUpdate(
        { code: String(code).toUpperCase() },
        { ...payload, code: String(code).toUpperCase() },
        { new: true, upsert: true, runValidators: true },
    );
};

exports.Rate = Rate;
