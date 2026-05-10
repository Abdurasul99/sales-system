const Utils = require('../service/utils');
const Supplier = require('../models/suppliers.model');

exports.list = async (req, res) => {
    try {
        const items = await Supplier.list({ q: req.query.q });
        return res.status(200).json(Utils.envelope({
            body: { items: items.map((s) => s.toClient()), total: items.length },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.getById = async (req, res) => {
    try {
        const found = await Supplier.findById(req.params.id);
        if (!found) return res.status(404).json(Utils.envelope({ code: '8002', message: 'Supplier not found' }));
        return res.status(200).json(Utils.envelope({ body: found.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.create = async (req, res) => {
    try {
        if (Utils.isEmpty(req.body.name)) return res.status(400).json(Utils.envelope({ code: '8001', message: 'Name is required' }));
        const created = await Supplier.create(req.body, res.locals.id);
        return res.status(200).json(Utils.envelope({ body: created.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await Supplier.update(req.params.id, req.body);
        if (!updated) return res.status(404).json(Utils.envelope({ code: '8002', message: 'Supplier not found' }));
        return res.status(200).json(Utils.envelope({ body: updated.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.remove = async (req, res) => {
    try {
        const ok = await Supplier.remove(req.params.id);
        if (!ok) return res.status(404).json(Utils.envelope({ code: '8002', message: 'Supplier not found' }));
        return res.status(200).json(Utils.envelope({ body: { id: req.params.id } }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};
