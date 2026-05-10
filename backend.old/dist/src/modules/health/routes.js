"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.healthRouter = router;
router.get("/", (_req, res) => {
    res.json({
        status: "ok",
        service: "sales-system-backend",
        timestamp: new Date().toISOString()
    });
});
