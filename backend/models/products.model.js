/**
 * models/products.model.js
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
        description: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        cost: { type: Number, default: 0, min: 0 }, // себестоимость в той же валюте, что и price
        currency: { type: String, default: 'UZS', uppercase: true },
        stock: { type: Number, default: 0, min: 0 },
        leadTimeDays: { type: Number, default: 14, min: 0 }, // срок поставки в днях
        category: { type: String, default: 'general', lowercase: true, trim: true },
        unit: { type: String, default: 'шт', trim: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

productSchema.methods.toClient = function () {
    const cost = this.cost || 0;
    const price = this.price || 0;
    const marginPct = price > 0 ? ((price - cost) / price) * 100 : 0;
    const markupPct = cost > 0 ? ((price - cost) / cost) * 100 : 0;
    return {
        id: this._id.toString(),
        name: this.name,
        sku: this.sku,
        description: this.description,
        price,
        cost,
        marginPct,
        markupPct,
        currency: this.currency,
        stock: this.stock,
        leadTimeDays: this.leadTimeDays || 0,
        unit: this.unit || 'шт',
        category: this.category,
        isActive: this.isActive,
    };
};

const Product = mongoose.model('Product', productSchema);

exports.listProducts = async ({ q, category } = {}) => {
    try {
        const filter = {};
        if (category) filter.category = category;
        if (q) filter.$text = { $search: q };
        return await Product.find(filter).sort({ createdAt: -1 });
    } catch (err) {
        console.error('listProducts error', err);
        return [];
    }
};

exports.findProductById = async (id) => {
    try {
        return await Product.findById(id);
    } catch (err) {
        console.error('findProductById error', err);
        return null;
    }
};

exports.createProduct = async (data, createdBy) => {
    try {
        return await Product.create({ ...data, createdBy });
    } catch (err) {
        console.error('createProduct error', err);
        return null;
    }
};

exports.updateProduct = async (id, data) => {
    try {
        return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (err) {
        console.error('updateProduct error', err);
        return null;
    }
};

exports.deleteProduct = async (id) => {
    try {
        const result = await Product.findByIdAndDelete(id);
        return result !== null;
    } catch (err) {
        console.error('deleteProduct error', err);
        return false;
    }
};

exports.Product = Product;
