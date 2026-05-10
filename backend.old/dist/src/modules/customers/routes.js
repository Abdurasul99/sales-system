"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const createCustomerSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    segmentId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(2),
    code: zod_1.z.string().min(2),
    type: zod_1.z.string().default("B2C"),
    segment: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(5).optional(),
    address: zod_1.z.string().optional()
});
const createInteractionSchema = zod_1.z.object({
    customerId: zod_1.z.string().min(1),
    channel: zod_1.z.string().min(2),
    summary: zod_1.z.string().min(3),
    happenedAt: zod_1.z.string().datetime().optional()
});
const router = (0, express_1.Router)();
exports.customersRouter = router;
router.use(auth_1.requireAuth);
router.get("/", async (req, res) => {
    const customers = await prisma_1.prisma.customer.findMany({
        where: { organizationId: req.auth.organizationId },
        include: {
            segmentRef: true,
            interactions: {
                orderBy: { happenedAt: "desc" },
                take: 5
            },
            salesOrders: true
        },
        orderBy: { createdAt: "desc" }
    });
    res.json({ customers });
});
router.post("/", (0, auth_1.requirePermission)("customer.manage"), async (req, res, next) => {
    try {
        const payload = createCustomerSchema.parse(req.body);
        const customer = await prisma_1.prisma.customer.create({
            data: {
                organizationId: req.auth.organizationId,
                ...payload,
                code: payload.code.toUpperCase()
            }
        });
        res.status(201).json({ customer });
    }
    catch (error) {
        next(error);
    }
});
router.post("/interactions", (0, auth_1.requirePermission)("crm.manage"), async (req, res, next) => {
    try {
        const payload = createInteractionSchema.parse(req.body);
        const interaction = await prisma_1.prisma.customerInteraction.create({
            data: {
                organizationId: req.auth.organizationId,
                customerId: payload.customerId,
                createdById: req.auth.userId,
                channel: payload.channel,
                summary: payload.summary,
                happenedAt: payload.happenedAt ? new Date(payload.happenedAt) : new Date()
            }
        });
        res.status(201).json({ interaction });
    }
    catch (error) {
        next(error);
    }
});
