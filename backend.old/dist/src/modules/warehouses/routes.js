"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warehousesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const createWarehouseSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    branchId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(2),
    code: zod_1.z.string().min(2),
    address: zod_1.z.string().optional()
});
const router = (0, express_1.Router)();
exports.warehousesRouter = router;
router.use(auth_1.requireAuth);
router.get("/", async (req, res) => {
    const warehouses = await prisma_1.prisma.warehouse.findMany({
        where: {
            company: {
                organizationId: req.auth.organizationId
            }
        },
        include: {
            branch: true,
            locations: true,
            inventory: {
                take: 10
            }
        },
        orderBy: { createdAt: "desc" }
    });
    res.json({ warehouses });
});
router.post("/", (0, auth_1.requirePermission)("warehouse.manage"), async (req, res, next) => {
    try {
        const payload = createWarehouseSchema.parse(req.body);
        const warehouse = await prisma_1.prisma.warehouse.create({
            data: {
                ...payload,
                code: payload.code.toUpperCase()
            }
        });
        res.status(201).json({ warehouse });
    }
    catch (error) {
        next(error);
    }
});
