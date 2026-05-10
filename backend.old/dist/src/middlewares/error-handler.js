"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(error, _req, res, _next) {
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            message: "Validation failed",
            issues: error.issues
        });
        return;
    }
    if (error instanceof Error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.status(500).json({ message: "Internal server error" });
}
