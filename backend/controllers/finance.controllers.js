const Utils = require('../service/utils');
const Tx = require('../models/finance.model');

function makeController(kind) {
    return {
        list: async (req, res) => {
            try {
                const items = await Tx.list({ kind, from: req.query.from, to: req.query.to });
                return res.status(200).json(Utils.envelope({
                    body: { items: items.map((x) => x.toClient()), total: items.length },
                }));
            } catch (err) {
                console.error(err);
                return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
            }
        },

        summary: async (req, res) => {
            try {
                const data = await Tx.summary({ kind, from: req.query.from, to: req.query.to });
                return res.status(200).json(Utils.envelope({ body: data }));
            } catch (err) {
                console.error(err);
                return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
            }
        },

        create: async (req, res) => {
            try {
                const { amount } = req.body;
                if (!(Number(amount) > 0)) {
                    return res.status(400).json(Utils.envelope({ code: '8001', message: 'Amount must be > 0' }));
                }
                const created = await Tx.create({ ...req.body, kind }, res.locals.id);
                return res.status(200).json(Utils.envelope({ body: created.toClient() }));
            } catch (err) {
                console.error(err);
                return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
            }
        },

        update: async (req, res) => {
            try {
                const updated = await Tx.update(req.params.id, req.body);
                if (!updated) return res.status(404).json(Utils.envelope({ code: '8002', message: 'Not found' }));
                return res.status(200).json(Utils.envelope({ body: updated.toClient() }));
            } catch (err) {
                console.error(err);
                return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
            }
        },

        remove: async (req, res) => {
            try {
                const ok = await Tx.remove(req.params.id);
                if (!ok) return res.status(404).json(Utils.envelope({ code: '8002', message: 'Not found' }));
                return res.status(200).json(Utils.envelope({ body: { id: req.params.id } }));
            } catch (err) {
                console.error(err);
                return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
            }
        },
    };
}

exports.expenses = makeController('expense');
exports.income = makeController('income');
