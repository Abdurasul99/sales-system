/**
 * models/users.model.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            match: [/^[a-z0-9_.-]+$/, 'Invalid username'],
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
        },
        password: { type: String, required: true, minlength: 6, select: false },
        role: {
            type: String,
            enum: ['founder', 'admin', 'manager', 'cashier', 'seller', 'user'],
            default: 'user',
        },
        roleLabel: { type: String, default: '' },
        state: { type: String, enum: ['ACTIVE', 'BLOCKED', 'INVITED'], default: 'ACTIVE' },
    },
    { timestamps: true }
);

userSchema.methods.toClient = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        username: this.username,
        email: this.email || '',
        role: this.role,
        roleLabel: this.roleLabel || '',
    };
};

const User = mongoose.model('User', userSchema);

exports.findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email, state: 'ACTIVE' });
    } catch (err) {
        console.error('findUserByEmail error', err);
        return null;
    }
};

exports.findUserByUsername = async (username) => {
    try {
        return await User.findOne({ username: String(username).toLowerCase(), state: 'ACTIVE' });
    } catch (err) {
        console.error('findUserByUsername error', err);
        return null;
    }
};

/**
 * Looks up user by username first, falls back to email if the input
 * looks like an email. Returns null if not found.
 */
exports.findUserByLogin = async (login) => {
    if (!login) return null;
    const value = String(login).trim().toLowerCase();
    if (value.includes('@')) {
        return await exports.findUserByEmail(value);
    }
    return await exports.findUserByUsername(value);
};

exports.findUserByLoginWithPassword = async (login) => {
    const found = await exports.findUserByLogin(login);
    if (!found) return null;
    return await User.findById(found._id).select('+password');
};

exports.findUserById = async (id) => {
    try {
        return await User.findById(id);
    } catch (err) {
        console.error('findUserById error', err);
        return null;
    }
};

exports.createUser = async ({ name, username, email, password, role, roleLabel }) => {
    try {
        const hash = await bcrypt.hash(password, 10);
        return await User.create({
            name,
            username: String(username).toLowerCase(),
            email: email ? String(email).toLowerCase() : undefined,
            password: hash,
            role: role || 'user',
            roleLabel: roleLabel || '',
        });
    } catch (err) {
        console.error('createUser error', err);
        return null;
    }
};

exports.matchPassword = async (plain, hash) => {
    return bcrypt.compare(plain, hash);
};

exports.User = User;
