const Utils = require('../service/utils');
const Currency = require('../models/currency.model');

exports.list = async (_req, res) => {
    try {
        const items = await Currency.list();
        return res.status(200).json(Utils.envelope({
            body: {
                base: 'UZS',
                items: items.map((i) => i.toClient()),
                total: items.length,
            },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.update = async (req, res) => {
    try {
        const { code } = req.params;
        const { rate, name } = req.body;
        if (!(Number(rate) > 0)) {
            return res.status(400).json(Utils.envelope({ code: '8001', message: 'rate must be > 0' }));
        }
        const updated = await Currency.upsert(code, {
            rate: Number(rate),
            name: name || code,
            source: 'manual',
        });
        return res.status(200).json(Utils.envelope({ body: updated.toClient() }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};
