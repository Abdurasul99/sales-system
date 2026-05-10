/**
 * models/categories.model.js
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, default: '' },
        color: { type: String, default: '#9333EA' },
        icon: { type: String, default: 'folder' },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

categorySchema.methods.toClient = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        slug: this.slug,
        description: this.description,
        color: this.color,
        icon: this.icon,
        isActive: this.isActive,
    };
};

const Category = mongoose.model('Category', categorySchema);

function slugify(value) {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9а-яё]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

exports.list = async () => {
    try {
        return await Category.find().sort({ name: 1 });
    } catch (err) {
        console.error('Category.list error', err);
        return [];
    }
};

exports.findById = async (id) => {
    try {
        return await Category.findById(id);
    } catch (err) {
        console.error('Category.findById error', err);
        return null;
    }
};

exports.findBySlug = async (slug) => {
    try {
        return await Category.findOne({ slug: slug.toLowerCase() });
    } catch (err) {
        console.error('Category.findBySlug error', err);
        return null;
    }
};

exports.create = async (data, createdBy) => {
    try {
        const slug = data.slug ? slugify(data.slug) : slugify(data.name);
        return await Category.create({
            ...data,
            slug,
            createdBy,
        });
    } catch (err) {
        console.error('Category.create error', err);
        return null;
    }
};

exports.update = async (id, data) => {
    try {
        const updates = { ...data };
        if (data.name && !data.slug) updates.slug = slugify(data.name);
        if (data.slug) updates.slug = slugify(data.slug);
        return await Category.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });
    } catch (err) {
        console.error('Category.update error', err);
        return null;
    }
};

exports.remove = async (id) => {
    try {
        const result = await Category.findByIdAndDelete(id);
        return result !== null;
    } catch (err) {
        console.error('Category.remove error', err);
        return false;
    }
};

exports.findOrCreateBySlug = async (slug, name) => {
    const cleanSlug = slugify(slug || name);
    const existing = await exports.findBySlug(cleanSlug);
    if (existing) return existing;
    return await exports.create({ name: name || slug, slug: cleanSlug });
};

exports.Category = Category;
