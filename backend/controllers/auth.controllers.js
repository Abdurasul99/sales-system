const jwt = require('jsonwebtoken');
const config = require('../config/key');
const Utils = require('../service/utils');
const User = require('../models/users.model');

function signToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        },
        config.SECRET_OR_KEY,
        { expiresIn: config.JWT_EXPIRES_IN }
    );
}

exports.signUp = async function (req, res) {
    try {
        const { name, username, email, password } = req.body;

        if (Utils.isEmpty(name) || Utils.isEmpty(username) || Utils.isEmpty(password)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Missing name, username or password',
            }));
        }

        const existingUsername = await User.findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json(Utils.envelope({
                code: '8011',
                message: 'This username is taken',
            }));
        }

        if (email) {
            const existingEmail = await User.findUserByEmail(email);
            if (existingEmail) {
                return res.status(400).json(Utils.envelope({
                    code: '8011',
                    message: 'This email is taken',
                }));
            }
        }

        const newUser = await User.createUser({ name, username, email, password });
        if (!newUser) {
            return res.status(500).json(Utils.envelope({
                code: '8012',
                message: 'Failed to create user',
            }));
        }

        const token = signToken(newUser);
        return res.status(200).json(Utils.envelope({
            body: { user: newUser.toClient(), token },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.signIn = async function (req, res) {
    try {
        const { login, username, email, password } = req.body;
        const loginValue = login || username || email;

        if (Utils.isEmpty(loginValue) || Utils.isEmpty(password)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'Missing username/email or password',
            }));
        }

        const user = await User.findUserByLoginWithPassword(loginValue);
        if (!user) {
            return res.status(400).json(Utils.envelope({
                code: '8002',
                message: 'User does not exist',
            }));
        }

        const ok = await User.matchPassword(password, user.password);
        if (!ok) {
            return res.status(400).json(Utils.envelope({
                code: '8003',
                message: 'Invalid credentials',
            }));
        }

        const token = signToken(user);
        return res.status(200).json(Utils.envelope({
            body: { user: user.toClient(), token },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.changePassword = async function (req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        if (Utils.isEmpty(currentPassword) || Utils.isEmpty(newPassword)) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'currentPassword and newPassword are required',
            }));
        }
        if (String(newPassword).length < 6) {
            return res.status(400).json(Utils.envelope({
                code: '8001',
                message: 'newPassword must be at least 6 characters',
            }));
        }

        const fullUser = await User.User.findById(res.locals.id).select('+password');
        if (!fullUser) {
            return res.status(404).json(Utils.envelope({ code: '8002', message: 'User not found' }));
        }
        const ok = await User.matchPassword(currentPassword, fullUser.password);
        if (!ok) {
            return res.status(400).json(Utils.envelope({
                code: '8003',
                message: 'Current password is wrong',
            }));
        }
        fullUser.password = newPassword; // pre-save hook? we hash below to be sure
        const bcrypt = require('bcryptjs');
        fullUser.password = await bcrypt.hash(newPassword, 10);
        await fullUser.save();
        return res.status(200).json(Utils.envelope({ body: { ok: true } }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.updateProfile = async function (req, res) {
    try {
        const { name, email } = req.body;
        const updates = {};
        if (typeof name === 'string' && name.trim()) updates.name = name.trim();
        if (typeof email === 'string') updates.email = email.trim().toLowerCase();
        const updated = await User.User.findByIdAndUpdate(res.locals.id, updates, {
            new: true,
            runValidators: true,
        });
        if (!updated) return res.status(404).json(Utils.envelope({ code: '8002', message: 'User not found' }));
        return res.status(200).json(Utils.envelope({ body: { user: updated.toClient() } }));
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json(Utils.envelope({ code: '8011', message: 'Email is already in use' }));
        }
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};

exports.getMe = async function (req, res) {
    try {
        const user = await User.findUserById(res.locals.id);
        if (!user) {
            return res.status(400).json(Utils.envelope({
                code: '8002',
                message: 'User does not exist',
            }));
        }

        return res.status(200).json(Utils.envelope({
            body: { user: user.toClient() },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({
            code: '9999',
            message: 'exception occurred',
            additionalMessage: err.message,
        }));
    }
};
