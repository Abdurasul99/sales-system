const jwt = require('jsonwebtoken');
const config = require('../config/key');
const Utils = require('../service/utils');

function extractToken(req) {
    if (req.headers['x-access-token']) return req.headers['x-access-token'];
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice('Bearer '.length).trim();
    }
    return req.query.token || null;
}

const verifyToken = (req, res, next) => {
    const clientToken = extractToken(req);

    if (!clientToken) {
        return res.status(403).json(Utils.envelope({
            code: '403',
            message: 'not logged in',
        }));
    }

    try {
        const decoded = jwt.verify(clientToken, config.SECRET_OR_KEY);

        if (decoded) {
            res.locals.id = decoded.id;
            res.locals.user_id = decoded.user_id;
            res.locals.email = decoded.email;
            res.locals.role = decoded.role;
            next();
        } else {
            return res.status(402).json(Utils.envelope({
                code: '402',
                message: 'unauthorized',
            }));
        }
    } catch (err) {
        return res.status(401).json(Utils.envelope({
            code: '401',
            message: 'token expired',
            additionalMessage: err.message,
        }));
    }
};

exports.verifyToken = verifyToken;
