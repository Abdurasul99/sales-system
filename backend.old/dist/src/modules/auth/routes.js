"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const auth_schemas_1 = require("./auth.schemas");
const auth_service_1 = require("./auth.service");
const router = (0, express_1.Router)();
exports.authRouter = router;
router.post("/bootstrap", async (req, res, next) => {
    try {
        const payload = auth_schemas_1.bootstrapSchema.parse(req.body);
        const result = await (0, auth_service_1.bootstrapOrganization)(prisma_1.prisma, payload);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post("/login", async (req, res, next) => {
    try {
        const payload = auth_schemas_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.login)(prisma_1.prisma, payload);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.get("/me", auth_1.requireAuth, async (req, res) => {
    res.json({ user: req.auth });
});
