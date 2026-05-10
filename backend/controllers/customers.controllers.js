const Utils = require('../service/utils');
const Customer = require('../models/customers.model');

exports.list = async (req, res) => {
    try {
        const items = await Customer.list({ q: req.query.q });
        return res.status(200).json(Utils.envelope({
            body: { items: items.map((c) => c.toClient()), total: items.length },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.getById = async (req, res) => {
    try {
        const found = await Customer.findById(req.params.id);
        if (!found) return res.status(404).json(Utils.envelope({ code: '8002', message: 'Customer not found' }));
        return res.status(200).json(Utils.envelope({ body: found.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.create = async (req, res) => {
    try {
        const { name } = req.body;
        if (Utils.isEmpty(name)) return res.status(400).json(Utils.envelope({ code: '8001', message: 'Name is required' }));
        const created = await Customer.create(req.body, res.locals.id);
        return res.status(200).json(Utils.envelope({ body: created.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await Customer.update(req.params.id, req.body);
        if (!updated) return res.status(404).json(Utils.envelope({ code: '8002', message: 'Customer not found' }));
        return res.status(200).json(Utils.envelope({ body: updated.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.remove = async (req, res) => {
    try {
        const ok = await Customer.remove(req.params.id);
        if (!ok) return res.status(404).json(Utils.envelope({ code: '8002', message: 'Customer not found' }));
        return res.status(200).json(Utils.envelope({ body: { id: req.params.id } }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};
