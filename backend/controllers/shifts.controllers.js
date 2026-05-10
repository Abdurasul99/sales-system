const Utils = require('../service/utils');
const Shift = require('../models/shifts.model');
const User = require('../models/users.model');

exports.list = async (_req, res) => {
    try {
        const items = await Shift.list();
        return res.status(200).json(Utils.envelope({
            body: { items: items.map((s) => s.toClient()), total: items.length },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.current = async (_req, res) => {
    try {
        const open = await Shift.findOpenForUser(res.locals.id);
        return res.status(200).json(Utils.envelope({
            body: { shift: open ? open.toClient() : null },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.open = async (req, res) => {
    try {
        const existing = await Shift.findOpenForUser(res.locals.id);
        if (existing) {
            return res.status(400).json(Utils.envelope({
                code: '8011',
                message: 'У вас уже есть открытая смена',
            }));
        }
        const user = await User.findUserById(res.locals.id);
        if (!user) return res.status(404).json(Utils.envelope({ code: '8002', message: 'User not found' }));
        const opened = await Shift.open(
            { id: user._id, name: user.name, username: user.username },
            Number(req.body.openingCash) || 0,
        );
        return res.status(200).json(Utils.envelope({ body: opened.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.close = async (req, res) => {
    try {
        const open = await Shift.findOpenForUser(res.locals.id);
        if (!open) return res.status(400).json(Utils.envelope({ code: '8002', message: 'No open shift' }));
        const updated = await Shift.close(
            open._id,
            Number(req.body.closingCash) || 0,
            req.body.notes || '',
        );
        return res.status(200).json(Utils.envelope({ body: updated.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};
