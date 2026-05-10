"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requirePermission = requirePermission;
const jwt_1 = require("../lib/jwt");
function requireAuth(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const token = authorization.replace("Bearer ", "");
        req.auth = (0, jwt_1.verifyAuthToken)(token);
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
}
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.auth) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!req.auth.permissions.includes(permission)) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        next();
    };
}
