"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const inventory_posting_service_1 = require("../../common/services/inventory-posting.service");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const inventory_domain_1 = require("./inventory-domain");
const movementSchema = zod_1.z.object({
    warehouseId: zod_1.z.string().min(1),
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.coerce.number().positive(),
    eventType: zod_1.z.enum([
        "PURCHASE_RECEIPT",
        "SALE_ISSUE",
        "RETURN_IN",
        "RETURN_OUT",
        "ADJUSTMENT",
        "RESERVATION",
        "RELEASE",
        "WRITE_OFF",
        "TRANSFER_IN",
        "TRANSFER_OUT"
    ]),
    note: zod_1.z.string().optional(),
    lotCode: zod_1.z.string().optional(),
    serialNumber: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().datetime().optional()
});
const router = (0, express_1.Router)();
exports.inventoryRouter = router;
router.use(auth_1.requireAuth);
router.get("/", (0, auth_1.requirePermission)("inventory.read"), async (req, res) => {
    const lowOnly = req.query.lowOnly === "true";
    const inventory = await prisma_1.prisma.inventoryBalance.findMany({
        where: {
            organizationId: req.auth.organizationId
        },
        include: {
            product: true,
            warehouse: true
        },
        orderBy: { updatedAt: "desc" }
    });
    const items = inventory
        .map((item) => ({
        ...item,
        available: (0, inventory_domain_1.calculateAvailability)({
            onHand: Number(item.onHand),
            reserved: Number(item.reserved)
        })
    }))
        .filter((item) => lowOnly ? item.available <= Number(item.product.reorderPoint) : true);
    res.json({ items });
});
router.post("/movements", (0, auth_1.requirePermission)("inventory.write"), async (req, res, next) => {
    try {
        const payload = movementSchema.parse(req.body);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const posted = await (0, inventory_posting_service_1.postInventoryMovement)({
                tx,
                organizationId: req.auth.organizationId,
                warehouseId: payload.warehouseId,
                productId: payload.productId,
                quantity: payload.quantity,
                eventType: payload.eventType,
                createdById: req.auth.userId,
                note: payload.note,
                lotCode: payload.lotCode,
                serialNumber: payload.serialNumber,
                expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : undefined
            });
            return {
                updated: posted.balance,
                movement: posted.movement
            };
        });
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
