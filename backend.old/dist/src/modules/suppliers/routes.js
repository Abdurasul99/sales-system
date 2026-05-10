"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppliersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const createSupplierSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    code: zod_1.z.string().min(2),
    contactName: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(5).optional(),
    address: zod_1.z.string().optional(),
    averageLeadDays: zod_1.z.coerce.number().min(0).default(0)
});
const router = (0, express_1.Router)();
exports.suppliersRouter = router;
router.use(auth_1.requireAuth);
router.get("/", async (req, res) => {
    const suppliers = await prisma_1.prisma.supplier.findMany({
        where: { organizationId: req.auth.organizationId },
        include: {
            purchaseOrders: {
                take: 3,
                orderBy: { createdAt: "desc" }
            }
        },
        orderBy: { createdAt: "desc" }
    });
    res.json({ suppliers });
});
router.post("/", (0, auth_1.requirePermission)("supplier.manage"), async (req, res, next) => {
    try {
        const payload = createSupplierSchema.parse(req.body);
        const supplier = await prisma_1.prisma.supplier.create({
            data: {
                organizationId: req.auth.organizationId,
                ...payload,
                code: payload.code.toUpperCase()
            }
        });
        res.status(201).json({ supplier });
    }
    catch (error) {
        next(error);
    }
});
